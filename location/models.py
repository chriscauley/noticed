from django.contrib.gis.db import models
from django.contrib.gis.geos import Point
from django.contrib.postgres.fields import JSONField

from unrest.models import BaseModel, _choices
from location.utils import get_geocode


class BaseLocationModel(BaseModel):
    class Meta:
        abstract = True

    name = models.CharField(max_length=256)
    latlon = models.PointField()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.latlon:
            geocode, new = Geocode.objects.get_or_create(query='address=' + self.get_address())
            results = geocode.result.get('results', [])
            if not results:
                raise NotImplementedError("Not setup to handle missing result")
            location = results[0]['geometry']['location']
            self.latlon = Point(location['lng'], location['lat'])
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


class Notice(BaseModel):
    class Meta:
        ordering = ('order', )

    photos = models.ManyToManyField('media.Photo', through='NoticePhoto')
    location = models.ForeignKey('Location', on_delete=models.CASCADE)
    order = models.IntegerField()

    def save(self, *args, **kwargs):
        if not self.order:
            self.order = Notice.objects.filter(location=self.location).count() + 1
        super().save(*args, **kwargs)


class NoticePhoto(models.Model):
    class Meta:
        ordering = ('-created', )

    created = models.DateTimeField(auto_now_add=True)
    STATUS_CHOICES = _choices(['new', 'accepted', 'rejected'])
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="new")
    photo = models.ForeignKey('media.Photo', on_delete=models.CASCADE)
    notice = models.ForeignKey('Notice', on_delete=models.CASCADE)


class Geocode(models.Model):
    query = models.CharField(max_length=256)
    result = JSONField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.result:
            self.result = get_geocode(self.query)
        super().save(*args, **kwargs)
