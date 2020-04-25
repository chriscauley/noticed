# Noticed

An app for sharing business hours affected by the 2020 quarantine.

# Setup notes

Run the following to create the database

```
sudo apt install postgresql postgresql-server-dev-10 postgresql-10-postgis-2.4
sudo apt-get install tesseract-ocr libtesseract-dev
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
createdb noticed
psql noticed -c "CREATE EXTENSION postgis;"
./manage.py migrate
```

```
./manage.py createsuperuser #now create a superuser
```

```
./manage.py shell # now create a site
```

# TODO

* If we want to get other developers involved we may need to support sqlite3 and not installing tesseract.

# MVP User story

* Geo detect location.

* Show list of places nearby with notices.

* See notices for a selected place

* Take photo, crop, and assign to location

* Take photo of existing notice.

# Notes

* Maybe use location IQ instead of google maps because of free quota https://locationiq.com/pricing