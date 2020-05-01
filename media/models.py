from django.conf import settings
from django.db import models

from unrest.models import BaseModel, _choices
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def get_exif(filename):
    exif = Image.open(filename)._getexif() or {}

    for key, value in exif.items():
        name = TAGS.get(key, key)
        exif[name] = exif.pop(key)

    if 'GPSInfo' in exif:
        for key in exif['GPSInfo'].keys():
            name = GPSTAGS.get(key,key)
            exif['GPSInfo'][name] = exif['GPSInfo'].pop(key)

    return exif

class Photo(BaseModel):
    filename = models.CharField(max_length=256, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    src = models.ImageField(upload_to="photo", null=True, blank=True)
    location = models.ForeignKey('location.Location', null=True, blank=True, on_delete=models.SET_NULL)
    notice = models.ForeignKey('location.Notice', null=True, blank=True, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs):
        self.filename = self.filename or str(self.src).split('/')[-1]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.filename

    class Meta:
        ordering = ('-updated', )
