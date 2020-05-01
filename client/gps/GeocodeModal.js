import React from 'react'
import css from '@unrest/css'
import Form from '@unrest/react-jsonschema-form'
import RestHook from '@unrest/react-rest-hook'

import connect from './connect'
import Modal from '../components/Modal'

const withGeocode = RestHook('/api/geocode/?query=${query || ""}')

const DummyLocation = connect((props) => {
  const onClick = () => {
    props.gps.actions.save({
      latitude: 39.9539431,
      longitude: -75.2116346,
      display: 'West Philly',
      source: 'dummy',
    })
    window.location.hash = ''
  }

  return (
    <div>
      <div className={css.h3()}>Sample Location</div>
      <p className="mb-2">
        Right now there is not a lot of data. Use this location to see a
        location with a lot of data.
      </p>
      <button className={css.button()} onClick={onClick}>
        West Philly
      </button>
    </div>
  )
})

export default class GeocodeModal extends React.Component {
  state = {}
  onSubmit = (formData) => this.setState(formData)
  render() {
    const schema = {
      type: 'object',
      title: 'Enter a location to get started',
      properties: {
        query: { type: 'string', title: 'Zipcode or address' },
      },
      required: ['query'],
    }

    return (
      <Modal>
        <Form schema={schema} onSubmit={this.onSubmit} />
        <GeocodeResults query={this.state.query} />
        <DummyLocation />
      </Modal>
    )
  }
}

const GeocodeResults = connect(
  withGeocode((props) => {
    const { results = [] } = props.api
    const { gps } = props
    const selectLocation = ({
      formatted_address,
      geometry,
      place_id,
    }) => () => {
      const { lat, lng } = geometry.location
      gps.actions.save({
        latitude: lat,
        longitude: lng,
        display: formatted_address.split(',')[0],
        source: 'google',
        place_id,
      })
      window.location.hash = ''
    }
    if (!results.length) {
      return gps.supported ? (
        <div>
          <div className={css.h3()}>
            Or we can look it up using your device.
          </div>
          {gps.error && (
            <div className={css.alert.error()}>
              There was an error reading your position. You may ty again below.
            </div>
          )}
          <button onClick={gps.actions.useGPS} className={css.button()}>
            <i className={css.icon('globe mr-2')} />
            Use GPS
          </button>
        </div>
      ) : null
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
