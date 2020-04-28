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
      store.setState({ error: null })
      const { latitude, longitude } = position.coords
      store.actions.save({
        latitude,
        longitude,
        source: 'gps',
        display: 'Current Location',
      })
    }
    const error = (e) => store.setState({ error: e.message })
    navigator.geolocation.getCurrentPosition(success, error)
  },
}

const makeHook = globalHook(React, getInitialState(), actions)

const connect = (Component) => {
  return function GpsProvider(props) {
    const [{ gps, error }, actions] = makeHook()
    const connectedProps = {
      ...props,
      gps: {
        supported: !!navigator.geolocation,
        ...gps,
        error,
        actions,
      },
    }

    return <Component {...connectedProps} />
  }
}

export default connect
