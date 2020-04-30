import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, HashRouter, Route } from 'react-router-dom'
import { sortBy } from 'lodash'

import Home from './screens/Home'
import Nav from './components/Nav'
import Footer from './components/Footer'
import auth from '@unrest/react-auth'
import location from './location'
import gps from './gps'
import alert from './alert'
import MyPhotos from './photo/MyPhotos'
import Zoom from './photo/Zoom'
import photo from './photo'

auth.config.login_redirect = '/images/'

const { AuthRoutes } = auth

auth.config.prepData = (data) => {
  const { user } = data
  const location_photos = {}
  const location_map = {}
  user.photos
    .map((photo) => ({
      ...photo,
      location: user.locations.find((l) => l.id === photo.location_id),
    }))
    .forEach((photo) => {
      const location = photo.location || {
        id: 0,
        name: 'Photos without a location',
      }
      location_map[location.id] = location
      location_photos[location.id] = location_photos[location.id] || []
      location_photos[location.id].push(photo)
    })

  user.locations = Object.keys(location_map)
    .sort()
    .map((_id) => ({
      ...location_map[_id],
      photos: location_photos[_id],
    }))

  user.recent_locations = sortBy(user.locations, (l) => l.last_photo).filter(
    (l) => l.id,
  )
  return data
}

const App = () => {
  return (
    <div className="container mx-auto">
      <BrowserRouter>
        <Nav />
        <div className="p-4" style={{ minHeight: 'calc(100vh - 230px)' }}>
          <Route exact path="/" component={Home} />
          <Route
            path="/location/:location_id/:slug/"
            component={location.Detail}
          />
          <Route path={'/gps/map/'} component={gps.Map} />
          <Route path={'/photo/'} component={MyPhotos} />
          <AuthRoutes />
        </div>
      </BrowserRouter>
      <HashRouter>
        <Route path={'/gps/search/'} component={gps.GeocodeModal} />
        <Route
          path={'/photo/:photo_id/locate/'}
          component={location.AutocompleteModal}
        />
        <Route path={`/photo/zoom/:src/`} component={Zoom} />
      </HashRouter>
      <Footer />
      <alert.List />
      <photo.BulkUpload />
    </div>
  )
}

const domContainer = document.querySelector('#react-app')
ReactDOM.render(<App />, domContainer)
