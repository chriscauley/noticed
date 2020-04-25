from django.contrib import admin
from django.urls import path
from django.urls import path, re_path, include

from unrest import views as unrest_views

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path('^(?:login|logout|signup|new)/', unrest_views.index),
    re_path('^$', unrest_views.index),
    re_path('^api/auth/', include('unrest.user.urls')),
]
