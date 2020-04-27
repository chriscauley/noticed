import React from 'react'
import RestHook from '@unrest/react-rest-hook'
import css from '@unrest/css'

import UploadNotice from './UploadNotice'
import withLocations from './withLocations'

const withLocation = RestHook(
  '/api/location/location/${match.params.location_id}/',
)

export default withLocation((props) => {
  const { loading, location, refetch } = props.api
  if (loading && !location) {
    return null
  }
  return (
    <div>
      <h2 className={css.h2()}>{location.name}</h2>
      <div>This place has {location.public_notices.length} notices.</div>
      {location.public_notices.map(({ src }) => (
        <div key={src}>
          <img src={src} />
        </div>
      ))}
      <UploadNotice
        location_id={location.id}
        onSuccess={() => {
          refetch(props)

          // home list needs to be refetched
          withLocations.markStale()
        }}
      />
    </div>
  )
})
