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

from location.models import Location, Notice, Geocode, NearbySearch, PlaceDetails
from media.models import Photo

MODELS = {
    'nearbysearch': NearbySearch,
    'geocode': Geocode,
}


def cached_google(request, model_name):
    model = MODELS[model_name]
    query = request.GET.get('query', None)
    if not query:
        return JsonResponse({})
    obj, new = model.objects.get_or_create(query='address=' + query)
    return JsonResponse({'results': obj.result['results']})


def location_list(request):
    lat, lon = request.GET['latlon'].split(',')
    user_point = Point(float(lon), float(lat), srid=4326)
    distance = D(m=request.GET.get('distance', 100))

    locations = Location.objects.annotate(distance=Distance('point', user_point)).order_by('distance')
    query = f"location={lat},{lon}&rankby=distance&type=establishment"
    nearbysearch, new = NearbySearch.objects.get_or_create(query=query)
    attrs = ['name', 'id', 'public_notice_count']
    return JsonResponse({
        'locations': [l.to_json(attrs) for l in locations],
        'nearbysearch': {
            'id': nearbysearch.id,
            'results': nearbysearch.result['results'],
        }
    })


@login_required
def location_from_place_id(request):
    data = json.loads(request.body.decode('utf-8') or "{}")
    location = Location.from_place_id(data['place_id'])
    return JsonResponse({'location': location.to_json(['id', 'name'])})


def location_detail(request, object_id):
    location = get_object_or_404(Location, id=object_id)
    attrs = ['name', 'id', 'public_notices']
    data = location.to_json(attrs)

    return JsonResponse({'location': data})


def add_photo_ids(user):
    photos = Photo.objects.filter(user=user)
    return {'photo_ids': list(photos.values_list('id', flat=True))}

user_json.get_extra = add_photo_ids

@login_required
def upload_notice(request):
    data = json.loads(request.body.decode('utf-8') or "{}")
    location = get_object_or_404(Location, id=data.get('location_id'))
    if data.get('notice_id'):
        notice = get_object_or_404(notice, id=data.get('notice_id'), location=location)
    else:
        notice = Notice.objects.create(location=location)

    # A lot of this is reused from gif-party/party/views.py
    # Abstract it out?
    uri = DataURI(data.pop('src'))
    f = ContentFile(uri.data, name=uri.name)
    photo = Photo(user=request.user)
    photo.src.save(f.name, f)
    photo.save()

    notice.photos.add(photo)
    notice.save()

    return JsonResponse({})
