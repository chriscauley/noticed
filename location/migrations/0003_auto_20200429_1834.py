# Generated by Django 2.2.12 on 2020-04-29 18:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_auto_20200429_1812'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notice',
            name='photos',
        ),
        migrations.DeleteModel(
            name='NoticePhoto',
        ),
    ]