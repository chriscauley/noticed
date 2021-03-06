import React from 'react'
import { Link } from 'react-router-dom'
import slugify from 'slugify'
import css from '@unrest/css'

import gps from '../gps/'
import withLocations from '../location/withLocations'
import * as gs from 'react-static-google-map'

const locationUrl = (l) => `/location/${l.id}/${slugify(l.name)}/`

let last_locations

const LocationList = gps.required(
  withLocations((props) => {
    const { loading, locations } = props.api
    last_locations = locations || last_locations
    if (loading && !last_locations) {
      return null
    }
    const { gps } = props
    return (
      <div className="p-4">
        <gs.StaticGoogleMap
          size="400x400"
          apiKey="AIzaSyAQDgeeUI0TbWvr5yi8CtBfSF2YjJb8jRs"
        >
          {last_locations.map(({ id, latitude, longitude }) => (
            <gs.Marker key={id} location={`${latitude},${longitude}`} />
          ))}
          <gs.Marker
            location={`${gps.latitude},${gps.longitude}`}
            color="blue"
            label="U"
          />
        </gs.StaticGoogleMap>
        <div className={css.h3()}>Select a location</div>
        <div className={css.list.outer()}>
          {last_locations.map(({ name, id, public_photo_count }) => (
            <Link
              to={locationUrl({ id, name })}
              key={id}
              className={css.list.action()}
            >
              <div>{name}</div>
              <div>{public_photo_count}</div>
            </Link>
          ))}
        </div>
      </div>
    )
  }),
)

export default function Home() {
  return (
    <div>
      <LocationList />
    </div>
  )
}
