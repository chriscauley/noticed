from django.contrib import admin

from location.models import Location, City, Geocode


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    pass


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    pass


@admin.register(Geocode)
class GeocodeAdmin(admin.ModelAdmin):
    pass
