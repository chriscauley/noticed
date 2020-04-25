from django.contrib import admin

from media.models import Photo


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    pass
