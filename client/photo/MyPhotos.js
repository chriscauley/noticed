import React from 'react'
import auth from '@unrest/react-auth'
import css from '@unrest/css'
import PhotoCard from './PhotoCard'

class MyPhotos extends React.Component {
  render() {
    const { user, loading, refetch } = this.props.auth
    if (!user && loading) {
      return null
    }

    return (
      <div>
        <div className={css.h1()}>Your Photos</div>
        {user.locations.map((location) => (
          <div key={location.id}>
            <div className={css.h2()}>
              {location.name || 'Photos without a location'}
            </div>
            <div className="flex flex-wrap -mx-2">
              {location.photos.map((photo) => (
                <PhotoCard {...photo} onDelete={refetch} key={photo.id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default auth.loginRequired(MyPhotos)
