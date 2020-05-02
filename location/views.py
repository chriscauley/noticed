import json
from datauri import DataURI

from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from unrest.user.views import user_json
from unrest.decorators import login_required

from location.models import Location, Notice, Geocode, NearbySearch, PlaceDetails, Autocomplete
from media.models import Photo
from media.forms import PhotoForm

MODELS = {
    'nearbysearch': NearbySearch,
    'geocode': Geocode,
    'autocomplete': Autocomplete,
}


def cached_google(request, model_name):
    model = MODELS[model_name]
    query = request.GET.get('query', None)
    if not query:
        return JsonResponse({})
    query_string = model.query_param + '=' + query
    if request.GET.get('location'):
        query_string += '&location=' + request.GET['location']
    obj, new = model.objects.get_or_create(query=query_string)
    return JsonResponse(obj.result)


def location_list(request):
    lat, lon = request.GET['latlon'].split(',')
    user_point = Point(float(lon), float(lat), srid=4326)
    distance = D(m=request.GET.get('distance', 2000))

    locations = Location.objects.filter(photo__isnull=False).distinct()
    locations = locations.annotate(distance=Distance('point', user_point))
    locations = locations.filter(distance__lt=distance).order_by('distance')[:10]
    query = f"location={lat},{lon}&rankby=distance&type=establishment"
    nearbysearch, new = NearbySearch.objects.get_or_create(query=query)
    attrs = ['name', 'id', 'public_photo_count', 'latitude', 'longitude']
    return JsonResponse({
        'locations': [l.to_json(attrs) for l in locations],
        'nearbysearch': {
            'id': nearbysearch.id,
            'results': nearbysearch.result['results'],
        }
    })


def location_from_place_id(request):
    data = json.loads(request.body.decode('utf-8') or "{}")
    location = Location.from_place_id(data['place_id'])
    return JsonResponse({'location': location.to_json(['id', 'name'])})


def location_detail(request, object_id):
    location = get_object_or_404(Location, id=object_id)
    attrs = ['name', 'id', 'public_photos', 'latitude', 'longitude']
    data = location.to_json(attrs)

    return JsonResponse({'location': data})


def add_photos(user):
    photos = Photo.objects.filter(user=user).prefetch_related('location')

    location_updated = {}
    for photo in photos:
        location_updated[photo.location_id] = location_updated.get(photo.location_id) or photo.updated

    photos = [p.to_json(['id', 'src', 'thumbnail', 'location_id']) for p in photos]
    location_ids = [p['location_id'] for p in photos if p['location_id']]
    locations = Location.objects.filter(id__in=location_ids)
    locations = [l.to_json(['id', 'name']) for l in locations]
    for location in locations:
        location['last_photo'] = location_updated[location['id']]
    return {
        'photos': photos,
        'locations': locations,
    }


user_json.get_extra = add_photos


@login_required
def delete_photo(request):
    data = json.loads(request.body.decode('utf-8') or "{}")
    photo = get_object_or_404(Photo, id=data.get('id'), user=request.user)
    photo.delete()
    return JsonResponse({})


@login_required
def locate_photo(request):
    data = json.loads(request.body.decode('utf-8') or "{}")
    photo = get_object_or_404(Photo, id=data.get('photo_id'), user=request.user)
    if 'place_id' in data:
        photo.location = Location.from_place_id(data['place_id'])
    elif 'location_id' in data:
        photo.location = Location.objects.get(id=data['location_id'])
    else:
        raise NotImplementedError('Must specify place_id or location_id')
    photo.save()
    return JsonResponse({})
