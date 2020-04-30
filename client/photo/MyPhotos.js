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
    const location_photos = {}
    const location_map = {}
    user.photos
      .map((photo) => ({
        ...photo,
        location: user.locations.find((l) => l.id === photo.location_id),
      }))
      .forEach((photo) => {
        const _id = photo.location ? photo.location.id : 0
        location_photos[_id] = location_photos[_id] || []
        location_photos[_id].push(photo)
        location_map[_id] = photo.location
      })

    const locations = Object.keys(location_map)
      .sort()
      .map((location_id) => {
        return {
          ...location_map[location_id],
          photos: location_photos[location_id],
        }
      })

    return (
      <div>
        <div className={css.h1()}>Your Photos</div>
        {locations.map((location) => (
          <div key={location.id}>
            <div className={css.h2()}>
              {location.name || 'Photos without a location'}
            </div>
            <div style={{ columns: 2 }}>
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

export default auth.withAuth(MyPhotos)
