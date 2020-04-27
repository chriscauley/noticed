import React from 'react'
import globalHook from 'use-global-hook'
import css from '@unrest/css'
import Form from '@unrest/react-jsonschema-form'

import Modal from './components/Modal'

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
        <div
          className={dropdown.toggle('truncate')}
          onClick={this.toggle}
          style={{ maxWidth: '8rem' }}
        >
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
          <a
            href="#/location/search/"
            className={dropdown.item()}
            onClick={this.toggle}
          >
            Search
          </a>
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

const required = (Component) =>
  connect((props) => {
    const { gps } = props
    return gps.source ? <Component {...props} /> : null
  })

class PlacePicker extends React.Component {
  state = {}
  onSubmit = (formData) => this.setState(formData)
  render() {
    const schema = {
      type: 'object',
      title: 'Enter a zipcode, address, or latlng',
      properties: {
        query: { type: 'string', title: '' },
      },
      required: ['query'],
    }

    return (
      <Modal>
        <Form schema={schema} onSubmit={this.onSubmit} />
        <PlaceSearch query={this.state.query} />
      </Modal>
    )
  }
}

import RestHook from '@unrest/react-rest-hook'

const withPlaceSearch = RestHook('/api/placesearch/?query=${query || ""}')

const PlaceSearch = connect(
  withPlaceSearch((props) => {
    const { results = [] } = props.api
    const selectLocation = ({
      formatted_address,
      geometry,
      place_id,
    }) => () => {
      const { lat, lng } = geometry.location
      props.gps.actions.save({
        latitude: lat,
        longitude: lng,
        display: formatted_address,
        source: 'google',
        place_id,
      })
    }
    if (!results.length) {
      return null
    }
    return (
      <div className={css.list.outer()}>
        {results.map((result) => (
          <div
            className={css.list.action()}
            key={result.place_id}
            onClick={selectLocation(result)}
          >
            {result.formatted_address}
          </div>
        ))}
      </div>
    )
  }),
)

export default {
  NavLink: connect(BaseNavLink),
  connect,
  required,
  PlacePicker,
}
