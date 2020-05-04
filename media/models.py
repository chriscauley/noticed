import arrow
from io import BytesIO

from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point
from django.core.files.base import ContentFile
from sorl.thumbnail import get_thumbnail

from unrest.decorators import cached_property
from unrest.models import BaseModel, _choices
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

_div = lambda v: float(v[0]) / float(v[1])
_0div = lambda v: f'{int(_div(v)):02d}'


def _convert_to_degrees(value, signref):
    """Helper function to convert the GPS coordinates stored in the EXIF to degress in float format"""
    d, m, s = map(_div, value)
    sign = -1 if signref in ['W', 'S'] else 1

    return sign * float(d + (m / 60.0) + (s / 3600.0))


def get_exif(path):
    exif = Image.open(path)._getexif() or {}

    for key, value in exif.items():
        name = TAGS.get(key, key)
        exif[name] = exif.pop(key)

    if 'GPSInfo' in exif:
        for key in exif['GPSInfo'].keys():
            name = GPSTAGS.get(key, key)
            exif['GPSInfo'][name] = exif['GPSInfo'].pop(key)

    return exif


class Photo(BaseModel):
    filename = models.CharField(max_length=256, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    src = models.ImageField(upload_to="photo")
    location = models.ForeignKey('location.Location', null=True, blank=True, on_delete=models.SET_NULL)
    notice = models.ForeignKey('location.Notice', null=True, blank=True, on_delete=models.SET_NULL)

    point = models.PointField(null=True, blank=True)
    datetime = models.DateTimeField(null=True, blank=True)
    DATASOURCE_CHOICES = _choices(['exif', 'exifgps', 'database', 'error'])
    datasource = models.CharField(max_length=16, choices=DATASOURCE_CHOICES, null=True, blank=True)

    latitude = property(lambda self: self.point and self.point[1])
    longitude = property(lambda self: self.point and self.point[0])

    @cached_property
    def crops(self):
        attrs = ['url', 'x', 'y', 'width', 'height', 'id']
        return [p.to_json(attrs) for p in self.photocrop_set.all()]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        try:
            self.filename = self.filename or str(self.src).split('/')[-1]
            self.assign_exif()
        except Exception as e:
            self.datasource = 'error'
            print(e)
        self.datetime = self.datetime or self.created
        super().save(*args, **kwargs)

    def __str__(self):
        return self.filename

    def assign_exif(self):
        exif = get_exif(self.src.path)
        if exif.get('GPSInfo'):
            self.datasource = 'exifgps'
            info = exif['GPSInfo']
            latitude = _convert_to_degrees(info['GPSLatitude'], info['GPSLatitudeRef'])
            longitude = _convert_to_degrees(info['GPSLongitude'], info['GPSLongitudeRef'])
            self.point = Point(longitude, latitude)
            if 'GPSDateStamp' in info and 'GPSTimeStamp' in info:
                date_str = info['GPSDateStamp'].replace(':', '-')
                time_str = ":".join(map(_0div, info['GPSTimeStamp']))
                self.datetime = arrow.get(f'{date_str} {time_str}').datetime
        elif 'DateTimeDigitized' in exif:
            self.datasource = 'exif'
            date_str, time_str = exif['DateTimeDigitized'].split(' ')
            date_str = date_str.replace(':', '-')
            self.datetime = arrow.get(f'{date_str} {time_str}').datetime

    @property
    def thumbnail(self):
        return get_thumbnail(self.src, 'x650', crop='center').url

    class Meta:
        ordering = ('-datetime', )


class PhotoCrop(BaseModel):
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE)
    src = models.ImageField(upload_to="photocrop")
    x = models.IntegerField()
    y = models.IntegerField()
    width = models.IntegerField()
    height = models.IntegerField()

    def makecrop(self):
        # Don' crop outside bounds of image
        width = min(self.photo.src.width, self.x + self.width)
        height = min(self.photo.src.height, self.y + self.height)
        box = (max(0, self.x), max(0, self.y), width, height)

        name = self.photo.src.name.split('/')[-1].rsplit('.', 1)
        name[0] += "{},{}x{},{}".format(*box)
        name = '.'.join(name)
        crop = Image.open(self.photo.src.path).crop(box)
        if crop.mode == "CMYK":
            crop = crop.convert("RGB")
        buf = BytesIO()
        crop.save(buf, "PNG")
        buf.seek(0)
        self.src.save(name, ContentFile(buf.read()))

    def save(self, *args, **kwargs):
        if not self.src:
            self.makecrop()
        super().save(*args, **kwargs)

    @property
    def url(self):
        return self.src.url
