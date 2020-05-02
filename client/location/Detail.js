import React from 'react'
import css from '@unrest/css'
import auth from '@unrest/react-auth'
import RestHook from '@unrest/react-rest-hook'

import PhotoCard from '../photo/PhotoCard'
import * as gs from 'react-static-google-map'

const withLocation = RestHook(
  '/api/location/location/${match.params.location_id}/',
)

export default auth.connect(
  withLocation((props) => {
    const { loading, location, refetch } = props.api
    if (loading && !location) {
      return null
    }
    const refreshAll = () => {
      props.auth.refetch()
      refetch(props)
    }
    const { latitude, longitude } = location
    return (
      <div>
        <h2 className={css.h2()}>{location.name}</h2>
        <div>This place has {location.public_photos.length} notices.</div>
        <div className="flex flex-wrap -mx-2">
          <div className="relative px-2 mb-4 w-full sm:w-1/2">
            <gs.StaticGoogleMap
              size="400x400"
              apiKey="AIzaSyAQDgeeUI0TbWvr5yi8CtBfSF2YjJb8jRs"
            >
              <gs.Marker location={`${latitude},${longitude}`} />
            </gs.StaticGoogleMap>
          </div>
          {location.public_photos.map((photo) => (
            <PhotoCard
              {...photo}
              onDelete={refreshAll}
              key={photo.id}
              location={location}
            />
          ))}
        </div>
      </div>
    )
  }),
)
