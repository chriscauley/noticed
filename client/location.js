import React from 'react'
import globalHook from 'use-global-hook'
import css from '@unrest/css'

const LS_KEY = '__location'

// copied from @unrest/react-auth/NavLink
const dropdown = css.CSS({
  shelf: 'border p-4 absolute right-0 top-100 bg-white min-w-full z-10',
  toggle: css.button('cursor-pointer'),
  outer: 'relative',
  item: 'cursor-pointer',
})

const getInitialState = () => {
  try {
    return { location: JSON.parse(localStorage.getItem(LS_KEY)) }
  } catch (_) {
    return {}
  }
}

const actions = {
  save: (store, location) => {
    store.setState({ location })
    localStorage.setItem(LS_KEY, JSON.stringify(location))
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
  return function LocationProvider(props) {
    const [{ location }, actions] = makeHook()
    const connectedProps = {
      ...props,
      location: {
        ...location,
        actions,
      },
    }

    return <Component {...connectedProps} />
  }
}

class BaseNavLink extends React.Component {
  state = {}
  _toggle = (callback) => () => {
    this.toggle()
    callback()
  }
  toggle = () => this.setState({ open: !this.state.open })

  render() {
    const { location } = this.props
    return (
      <div className={dropdown.outer()}>
        <div className={dropdown.toggle()} onClick={this.toggle}>
          <i className="fa fa-map-marker mr-2" />
          {location.source ? location.display : '???'}
        </div>
        <div
          className={dropdown.shelf(this.state.open ? 'block' : 'hidden')}
          style={{ minWidth: 180 }}
        >
          <div
            className={dropdown.item()}
            onClick={this._toggle(location.actions.useGPS)}
          >
            Current Location
          </div>
          <div className={dropdown.item()} onClick={() => {}}>
            From Zip
          </div>
          <div
            className={dropdown.item()}
            onClick={this._toggle(() => location.actions.save(null))}
          >
            Clear
          </div>
        </div>
      </div>
    )
  }
}

export default {
  NavLink: connect(BaseNavLink),
  connect,
}
