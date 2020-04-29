import React from 'react'
import css from '@unrest/css'
import auth from '@unrest/react-auth'
import { post } from '@unrest/react-jsonschema-form'

import DeleteButton from '../DeleteButton'

const isOwner = (_id, user) => user && user.photos.find((p) => p.id === _id)

const PhotoCard = (props) => {
  const { src, id, onDelete, auth, children } = props
  const owner = isOwner(id, auth.user)
  const deletePhoto = () => post('/api/media/photo/delete/', { id })
  return (
    <div className="relative">
      {owner && (
        <div className="absolute top-0 right-0 m-4">
          <DeleteButton action={deletePhoto} onDelete={onDelete} name="Photo" />
        </div>
      )}
      <img src={src} />
      <div className="absolute bottom-0 right-0 m-4">{children}</div>
    </div>
  )
}

export default auth.withAuth(PhotoCard)
