import React from 'react'
import globalHook from 'use-global-hook'

const LS_KEY = '__geolocation'

const getInitialState = () => {
  try {
    return { gps: JSON.parse(localStorage.getItem(LS_KEY)) }
  } catch (_) {
    return {}
  }
}

const actions = {
  save: (store, gps) => {
    store.setState({ gps })
    localStorage.setItem(LS_KEY, JSON.stringify(gps))
  },
  useGPS: (store) => {
    const success = (position) => {
      const { latitude, longitude } = position.coords
      store.actions.save({
        latitude,
        longitude,
        source: 'gps',
        display: 'Current Location',
      })
    }
    const error = (e) => console.error(e)
    navigator.geolocation.getCurrentPosition(success, error)
  },
}

const makeHook = globalHook(React, getInitialState(), actions)

const connect = (Component) => {
  return function GpsProvider(props) {
    const [{ gps }, actions] = makeHook()
    const connectedProps = {
      ...props,
      gps: {
        ...gps,
        actions,
      },
    }

    return <Component {...connectedProps} />
  }
}

connect.required = (Component) =>
  connect((props) => {
    const { gps } = props
    return gps.source ? <Component {...props} /> : null
  })

export default connect
