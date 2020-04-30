import React from 'react'
import { Link } from 'react-router-dom'
import slugify from 'slugify'
import css from '@unrest/css'

import gps from '../gps/'
import withLocations from '../location/withLocations'

const locationUrl = (l) => `/location/${l.id}/${slugify(l.name)}/`

const LocationList = gps.required(
  withLocations((props) => {
    const { loading, locations } = props.api
    if (loading && !locations) {
      return null
    }
    return (
      <div className="p-4">
        <div className={css.h3()}>Select a location</div>
        <div className={css.list.outer()}>
          {locations.map(({ name, id, public_photo_count }) => (
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
