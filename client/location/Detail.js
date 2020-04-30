import React from 'react'
import css from '@unrest/css'
import auth from '@unrest/react-auth'
import RestHook from '@unrest/react-rest-hook'

import UploadNotice from './UploadNotice'
import PhotoCard from '../photo/PhotoCard'
import GoogleStaticMap from '../GoogleStaticMap'

const withLocation = RestHook(
  '/api/location/location/${match.params.location_id}/',
)

export default auth.withAuth(
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
        <GoogleStaticMap latlon={`${latitude},${longitude}`} size="400x400" />
        <div className="flex flex-wrap">
          {location.public_photos.map((photo) => (
            <div key={photo.id} className="p-2 w-full md:w-1/2">
              <PhotoCard {...photo} onDelete={refreshAll} />
            </div>
          ))}
        </div>
        <UploadNotice
          location_id={location.id}
          onSuccess={() => {
            // home list needs to be refetched
            refreshAll()
          }}
        />
      </div>
    )
  }),
)
