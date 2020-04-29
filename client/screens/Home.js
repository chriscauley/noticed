import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import slugify from 'slugify'
import css from '@unrest/css'
import { post } from '@unrest/react-jsonschema-form'

import gps from '../gps/'
import withLocations from '../location/withLocations'

const locationUrl = (l) => `/location/${l.id}/${slugify(l.name)}/`

const NearbyList = withRouter((props) => {
  const { locations, nearbysearch, history } = props
  const _place_ids = locations.map((l) => l.external_id)
  const nearby_places = nearbysearch.results.filter(
    ({ place_id }) => !_place_ids.includes(place_id),
  )
  const onClick = ({ place_id }) => () => {
    post('/api/location/from_place_id/', { place_id }).then(({ location }) => {
      withLocations.markStale()
      history.push(locationUrl(location))
    })
  }
  return (
    <>
      <div className={css.h3()}>Locations without notices (yet...)</div>
      <div className={css.list.outer()}>
        {nearby_places.map((place) => (
          <div
            onClick={onClick(place)}
            key={place.place_id}
            className={css.list.action()}
          >
            {place.name}
          </div>
        ))}
      </div>
    </>
  )
})

const LocationList = gps.required(
  withLocations((props) => {
    const { loading, locations, nearbysearch } = props.api
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
        <NearbyList locations={locations} nearbysearch={nearbysearch} />
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
