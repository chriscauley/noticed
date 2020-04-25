INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.gis',
    'server',
    'location',
    'media',
    'unrest.nopass',
    'unrest.user',
]

AUTH_USER_MODEL = 'user.User'
