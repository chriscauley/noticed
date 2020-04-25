import React from 'react'

import globalHook from 'use-global-hook'

const LS_KEY = '__location'

const getInitialState = () => {
  try {
    return { location: JSON.parse(localStorage.getItem(LS_KEY)) }
  } catch {
    return {}
  }
}

const actions = {
  saveLocation: (store, location) => {
    store.setState({ location })
    localStorage.setItem(LS_KEY, JSON.stringify(location))
  },
}
const makeHook = globalHook(React, getInitialState(), actions)

export const withLocation = (Component) => {
  return function LocationProvider(props) {
    const [{ location }, { saveLocation }] = makeHook()
    const connectedProps = {
      ...props,
      location,
      saveLocation,
    }

    return <Component {...connectedProps} />
  }
}
