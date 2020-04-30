import React from 'react'
import css from '@unrest/css'
import auth from '@unrest/react-auth'
import { post } from '@unrest/react-jsonschema-form'
import { ZoomButton } from './Zoom'

import DeleteButton from '../DeleteButton'

const isOwner = (_id, user) => user && user.photos.find((p) => p.id === _id)

const PhotoCard = (props) => {
  const { src, id, onDelete, auth, location } = props
  const owner = isOwner(id, auth.user)
  const deletePhoto = () => post('/api/media/photo/delete/', { id })
  return (
    <div className="relative mb-4">
      <div className="absolute top-0 right-0 m-4">
        <ZoomButton src={src} />
        {owner && (
          <DeleteButton action={deletePhoto} onDelete={onDelete} name="Photo" />
        )}
      </div>
      <img src={src} />
      <div className="absolute bottom-0 right-0 m-4">
        {owner && (
          <a
            href={`#/photo/${id}/locate/`}
            className={css.button[location ? 'primary' : 'warning']()}
          >
            <i className={css.icon('edit mr-2')} />
            {location ? location.name : 'needs location'}
          </a>
        )}
      </div>
    </div>
  )
}

export default auth.withAuth(PhotoCard)
