# Generated by Django 2.2.12 on 2020-05-04 17:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('media', '0006_auto_20200502_1415'),
    ]

    operations = [
        migrations.CreateModel(
            name='PhotoCrop',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('src', models.ImageField(upload_to='photocrop')),
                ('x', models.IntegerField()),
                ('y', models.IntegerField()),
                ('width', models.IntegerField()),
                ('height', models.IntegerField()),
                ('photo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='media.Photo')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
