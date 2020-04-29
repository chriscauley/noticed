import React from 'react'
import css from '@unrest/css'
import auth from '@unrest/react-auth'
import RestHook from '@unrest/react-rest-hook'
import { post } from '@unrest/react-jsonschema-form'

import UploadNotice from './UploadNotice'
import DeleteButton from '../DeleteButton'

const withLocation = RestHook(
  '/api/location/location/${match.params.location_id}/',
)

const NoticePhoto = (props) => {
  const { owner, src, id, onDelete } = props
  const deletePhoto = () => {
    return post('/api/media/photo/delete/', { id })
  }
  return (
    <div className="m-2 relative">
      {owner && (
        <DeleteButton action={deletePhoto} onDelete={onDelete} name="Photo" />
      )}
      <img src={src} />
    </div>
  )
}

export default auth.withAuth(
  withLocation((props) => {
    const { loading, location, refetch } = props.api
    if (loading && !location) {
      return null
    }
    const user_photo_ids = props.auth.user ? props.auth.user.photo_ids : []
    const refreshAll = () => {
      props.auth.refetch()
      refetch(props)
    }
    return (
      <div>
        <h2 className={css.h2()}>{location.name}</h2>
        <div>This place has {location.public_photos.length} notices.</div>
        {location.public_photos.map((photo) => (
          <NoticePhoto
            {...photo}
            key={photo.id}
            auth={props.auth}
            onDelete={refreshAll}
            owner={user_photo_ids.includes(photo.id)}
          />
        ))}
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
