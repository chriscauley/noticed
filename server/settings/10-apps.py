INSTALLED_APPS = [
    # django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.gis',

    # 3rd party
    'sorl.thumbnail',

    # this project
    'server',
    'location',
    'media',

    # unrest
    'unrest',
    'unrest.nopass',
    'unrest.user',
]

AUTH_USER_MODEL = 'user.User'
