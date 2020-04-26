from django.shortcuts import render
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.http import JsonResponse

from location.models import Location

def location_list(request):
  lat, lon = request.GET['latlon'].split(',')
  user_point = Point(float(lon), float(lat), srid=4326)
  distance = D(m=request.GET.get('distance', 100000000))

  locations = Location.objects.annotate(distance=Distance('point', user_point)).order_by('distance')

  attrs = ['name', 'id', 'notice_count']
  return JsonResponse({
    'locations': [l.to_json(attrs) for l in locations]
  })