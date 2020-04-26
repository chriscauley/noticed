from django.contrib import admin
from django.urls import path
from django.urls import path, re_path, include

from location.views import location_list
from unrest import views as unrest_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/location/location/', location_list),
    re_path('^(?:login|logout|signup|new|location)/', unrest_views.index),
    re_path('^$', unrest_views.index),
    re_path('^api/auth/', include('unrest.user.urls')),
]
