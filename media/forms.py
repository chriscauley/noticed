from django import forms

from media.models import Photo


class PhotoForm(forms.ModelForm):
    location_id = forms.IntegerField(required=False)
    def clean_location_id(self):
        location_id = self.cleaned_data.get('location_id')
        if location_id and not Location.objects.filter(id=location_id):
            raise forms.ValidationError(f"Location with id #{location_id} does not exist")
        return location_id
    def save(self, commit=True):
        photo = super().save(commit=False)
        self.instance.user = self.request.user
        photo.save()
        return photo

    class Meta:
        model = Photo
        fields = ('src', 'location_id')
