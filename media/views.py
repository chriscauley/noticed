import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from unrest.user.views import user_json
from unrest.decorators import login_required

from location.models import Location
from media.models import Photo, PhotoCrop


def photo_crops(request, photo_id):
    photo = get_object_or_404(Photo, id=photo_id)
    return JsonResponse(photo.to_json(['id', 'crops']))


def crop_photo(request):
    data = json.loads(request.body.decode('utf-8') or "{}")
    photo = get_object_or_404(Photo, id=data.get('photo_id'))
    if photo.user != request.user:
        raise NotImplementedError('You cannot edit this photo')
    if data.get('photocrop_id'):
        photocrop = get_object_or_404(PhotoCrop, id=data.get(photocrop_id))
    else:
        photocrop = PhotoCrop(photo=photo)
    for attr in ['x', 'y', 'width', 'height']:
        setattr(photocrop, attr, round(data[attr]))
    photocrop.save()
    return JsonResponse({})


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
