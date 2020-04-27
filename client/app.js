import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, HashRouter, Route } from 'react-router-dom'

import Home from './screens/Home'
import Nav from './components/Nav'
import Footer from './components/Footer'
import auth from '@unrest/react-auth'
import location from './location'
import gps from './gps'

auth.config.login_redirect = '/images/'

const { AuthRoutes } = auth

const App = () => {
  return (
    <div className="container mx-auto">
      <BrowserRouter>
        <Nav />
        <div style={{ minHeight: 'calc(100vh - 230px)' }}>
          <Route exact path="/" component={Home} />
          <Route
            path="/location/:location_id/:slug/"
            component={location.Detail}
          />
          <AuthRoutes />
        </div>
      </BrowserRouter>
      <HashRouter>
        <Route path="/location/search/" component={gps.PlacePicker} />
      </HashRouter>
      <Footer />
    </div>
  )
}

const domContainer = document.querySelector('#react-app')
ReactDOM.render(<App />, domContainer)
