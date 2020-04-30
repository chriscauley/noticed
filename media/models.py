from django.conf import settings
from django.db import models

from unrest.models import BaseModel, _choices


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
        ordering = ('created', )
