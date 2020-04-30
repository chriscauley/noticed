from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.urls import path, re_path, include

from location.views import location_list, location_detail, upload_notice, cached_google, location_from_place_id, delete_photo, locate_photo
from unrest import views as unrest_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/location/location/', location_list),
    path('api/location/location/<int:object_id>/', location_detail),
    path('api/location/noticephoto/', upload_notice),
    path('api/location/from_place_id/', location_from_place_id),
    path('api/location/from_place_id/', location_from_place_id),
    path('api/media/photo/delete/', delete_photo),
    path('api/media/photo/locate/', locate_photo),
    re_path('api/(nearbysearch|geocode|autocomplete)/', cached_google),
    re_path('^(?:login|logout|signup|reset-password|new|location|gps|photo)/', unrest_views.index),
    re_path('^$', unrest_views.index),
    re_path('', include('unrest.user.urls')),
]

if settings.DEBUG:  # pragma: no cover
    from django.views.static import serve
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
            'show_indexes': True
        }),
    ]
