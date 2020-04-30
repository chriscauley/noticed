import requests

from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point
from django.contrib.postgres.fields import JSONField

from unrest.models import BaseModel, _choices


class BaseLocationModel(BaseModel):
    class Meta:
        abstract = True

    name = models.CharField(max_length=256)
    point = models.PointField()

    SOURCE_CHOICES = _choices(['unknown', 'google'])
    external_id = models.CharField(max_length=32, null=True, blank=True)
    external_source = models.CharField(max_length=16, default='google')
    latitude = lambda self: self.point[1]
    longitude = lambda self: self.point[0]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.point:
            geocode, new = Geocode.objects.get_or_create(query='address=' + self.get_address())
            results = geocode.result.get('results', [])
            if not results:
                raise NotImplementedError("Not setup to handle missing result")
            location = results[0]['geometry']['location']
            self.point = Point(location['lng'], location['lat'])
            self.external_source = 'google'
            self.external_id = results[0]['place_id']
        super().save(*args, **kwargs)


class City(BaseLocationModel):
    state = models.CharField(max_length=2)
    country = models.CharField(max_length=2)

    def get_address(self):
        return f"{self.name}, {self.state}"


class Location(BaseLocationModel):
    city = models.ForeignKey("City", on_delete=models.CASCADE)
    zipcode = models.CharField(max_length=5)

    def get_address(self):
        return f"{self.name}, {self.city.get_address()}, {self.zipcode}"

    def get_public_photos(self):
        return self.photo_set.all()

    @property
    def public_photo_count(self):
        return self.get_public_photos().count()

    @property
    def public_photos(self):
        photos = []
        for photo in self.get_public_photos():
            photos.append({
                'src': photo.src.url,
                'id': photo.id,
            })
        return photos

    @staticmethod
    def from_place_id(place_id):
        placedetails, new = PlaceDetails.objects.get_or_create(query=f"place_id={place_id}")
        location = Location.objects.filter(external_source="google", external_id=place_id).first()
        if not location:
            result = placedetails.result['result']
            city_name = zipcode = country = None
            for component in result['address_components']:
                types = component['types']
                if 'locality' in component['types']:
                    city_name = component['short_name']
                elif 'postal_code' in component['types']:
                    zipcode = component['short_name']
                elif 'country' in component['types']:
                    country = component['short_name']
            if not all([city_name, zipcode, country]):
                raise NotImplementedError("Couldn't find city")
            city, new = City.objects.get_or_create(
                name=city_name,
                country=country,
            )
            _location = result['geometry']['location']
            location = Location.objects.create(
                name=result['name'],
                city=city,
                zipcode=zipcode,
                point=Point(_location['lng'], _location['lat']),
                external_source="google",
                external_id=place_id,
            )
            print("New location", location)
        return location


class Notice(BaseModel):
    class Meta:
        ordering = ('order', )

    location = models.ForeignKey('Location', on_delete=models.CASCADE)
    order = models.IntegerField()

    @property
    def photo(self):
        return self.photo_set.all().first()

    def save(self, *args, **kwargs):
        if not self.order:
            self.order = Notice.objects.filter(location=self.location).count() + 1
        super().save(*args, **kwargs)


class GoogleMapsCacheModel(models.Model):
    class Meta:
        abstract = True

    query = models.CharField(max_length=256)
    result = JSONField(null=True, blank=True)

    def get_result(self):
        url = f"{self.BASE_URL}?{self.query}&key={settings.GOOGLE_MAPS_API_KEY}"
        print("Making google api request", url)
        request = requests.get(url)
        request.raise_for_status()
        return request.json()

    def save(self, *args, **kwargs):
        if not self.result:
            self.result = self.get_result()
        super().save(*args, **kwargs)


class Geocode(GoogleMapsCacheModel):
    query_param = 'address'
    BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'


class NearbySearch(GoogleMapsCacheModel):
    BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"


class PlaceDetails(GoogleMapsCacheModel):
    BASE_URL = "https://maps.googleapis.com/maps/api/place/details/json"


class Autocomplete(GoogleMapsCacheModel):
    query_param = 'input'
    BASE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json"

