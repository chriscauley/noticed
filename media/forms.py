from django import forms

from media.models import Photo


class PhotoForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['location'].required = False

    def save(self, commit=True):
        photo = super().save(commit=False)
        self.instance.user = self.request.user
        photo.save()
        return photo

    class Meta:
        model = Photo
        fields = ('src', 'location')
