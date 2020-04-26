import React from 'react'
import globalHook from 'use-global-hook'
import css from '@unrest/css'

const LS_KEY = '__geolocation'

// copied from @unrest/react-auth/NavLink
const dropdown = css.CSS({
  shelf: 'border p-4 absolute right-0 top-100 bg-white min-w-full z-10',
  toggle: css.button('cursor-pointer'),
  outer: 'relative',
  item: 'cursor-pointer',
})

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

class BaseNavLink extends React.Component {
  state = {}
  _toggle = (callback) => () => {
    this.toggle()
    callback()
  }
  toggle = () => this.setState({ open: !this.state.open })

  render() {
    const { gps } = this.props
    return (
      <div className={dropdown.outer()}>
        <div className={dropdown.toggle()} onClick={this.toggle}>
          <i className="fa fa-map-marker mr-2" />
          {gps.source ? gps.display : '???'}
        </div>
        <div
          className={dropdown.shelf(this.state.open ? 'block' : 'hidden')}
          style={{ minWidth: 180 }}
        >
          <div
            className={dropdown.item()}
            onClick={this._toggle(gps.actions.useGPS)}
          >
            Current Location
          </div>
          <div className={dropdown.item()} onClick={() => {}}>
            From Zip
          </div>
          <div
            className={dropdown.item()}
            onClick={this._toggle(() => gps.actions.save(null))}
          >
            Clear
          </div>
        </div>
      </div>
    )
  }
}

const required = Component => (
  connect(props => {
    const { gps } = props
    return gps.source ? <Component {...props} /> : null
  })
)

export default {
  NavLink: connect(BaseNavLink),
  connect,
  required,
}
