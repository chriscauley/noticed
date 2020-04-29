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

let _timeout

const actions = {
  save: (store, gps) => {
    const count = (store.state.count || 0) + 1
    store.setState({ gps, updated: new Date(), count })
    localStorage.setItem(LS_KEY, JSON.stringify(gps))
  },
  useGPS: (store) => {
    store.setState({ checked: new Date() })
    const success = (position) => {
      store.setState({ error: null })
      const { latitude, longitude } = position.coords
      const { gps } = store.state
      if (gps && latitude === gps.latitude && longitude === gps.longitude) {
        return
      }
      store.actions.save({
        latitude,
        longitude,
        source: 'gps',
        display: 'Current Location',
      })
    }
    const error = (e) => store.setState({ error: e.message })
    navigator.geolocation.getCurrentPosition(success, error)
    _timeout = setTimeout(store.actions.autoUpdate, 10000)
  },
  autoUpdate: (store) => {
    const { gps } = store.state
    if (gps && gps.source === 'gps') {
      store.actions.useGPS()
    }
  },
}

const makeHook = globalHook(React, getInitialState(), actions)

const connect = (Component) => {
  return function GpsProvider(props) {
    const [{ gps, error, checked, updated, count = 0 }, actions] = makeHook()
    clearTimeout(_timeout)
    _timeout = setTimeout(actions.autoUpdate, 1000)
    const connectedProps = {
      ...props,
      gps: {
        supported: !!navigator.geolocation,
        ...gps,
        error,
        checked,
        updated,
        actions,
        count,
      },
    }

    return <Component {...connectedProps} />
  }
}

export default connect
