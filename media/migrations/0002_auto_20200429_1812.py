# Generated by Django 2.2.12 on 2020-04-29 18:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_auto_20200429_1812'),
        ('media', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='photo',
            name='location',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='location.Location'),
        ),
        migrations.AddField(
            model_name='photo',
            name='notice',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='location.Notice'),
        ),
    ]