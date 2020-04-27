from django.conf import settings
import requests
import cv2
import pytesseract


def get_image_text(path):
    img = cv2.imread(path)
    return pytesseract.image_to_string(img)
