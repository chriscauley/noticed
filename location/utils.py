from django.conf import settings
import requests
import cv2
import pytesseract


def get_geocode(query):
    BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json?{query}&key={key}'
    url = BASE_URL.format(query=query, key=settings.GOOGLE_MAPS_API_KEY)
    request = requests.get(url)
    request.raise_for_status()
    return request.json()


def get_image_text(path):
    img = cv2.imread(path)
    return pytesseract.image_to_string(img)
