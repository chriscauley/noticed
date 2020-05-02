from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.urls import path, re_path, include

from location.views import location_list, location_detail, cached_google, location_from_place_id, delete_photo, locate_photo
from unrest.views import spa

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/location/location/', location_list),
    path('api/location/location/<int:object_id>/', location_detail),
    path('api/location/from_place_id/', location_from_place_id),
    path('api/location/from_place_id/', location_from_place_id),
    path('api/media/photo/delete/', delete_photo),
    path('api/media/photo/locate/', locate_photo),
    re_path('api/(nearbysearch|geocode|autocomplete)/', cached_google),
    re_path('^(location|gps|photo)/', spa),
    re_path('', include('unrest.urls')),
]
