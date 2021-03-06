# Generated by Django 2.2.12 on 2020-04-29 18:13

from django.db import migrations

def populate(apps, schema_editor):
    # We can't import the Person model directly as it may be a newer
    # version than this migration expects. We use the historical version.
    Photo = apps.get_model('media', 'Photo')
    Notice = apps.get_model('location', 'Notice')
    Location = apps.get_model('location', 'Location')
    for photo in Photo.objects.all():
        print(photo.id, photo.location_id, photo.notice_id)
        notice = Notice.objects.filter(photos=photo).first()
        photo.notice = notice
        photo.location = notice.location
        photo.save()


class Migration(migrations.Migration):

    dependencies = [
        ('media', '0002_auto_20200429_1812'),
    ]

    operations = [
        migrations.RunPython(populate, lambda a,b: None)
    ]
