import React from 'react'
import auth from '@unrest/react-auth'
import css from '@unrest/css'
import PhotoCard from './PhotoCard'

class MyPhotos extends React.Component {
  render() {
    const { user, loading, refetch } = this.props.auth
    if (!user || loading) {
      return null
    }
    const photos = user.photos.map((photo) => ({
      ...photo,
      location: user.locations.find((l) => l.id === photo.location_id),
    }))
    return (
      <div>
        <div className={css.h1()}>Your Photos</div>
        <div className="flex flex-wrap">
          {photos.map((photo) => (
            <div key={photo.id} className="p-2 w-full md:w-1/2">
              <PhotoCard {...photo} onDelete={refetch}>
                <a
                  href={`#/photo/${photo.id}/locate/`}
                  className={css.button()}
                >
                  <i className={css.icon('edit mr-2')} />
                  {photo.location ? photo.location.name : 'has not location'}
                </a>
              </PhotoCard>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default auth.withAuth(MyPhotos)
