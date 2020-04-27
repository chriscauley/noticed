import React from 'react'
import css from '@unrest/css'
import Form from '@unrest/react-jsonschema-form'
import RestHook from '@unrest/react-rest-hook'

import connect from './connect'
import Modal from '../components/Modal'

const withGeocode = RestHook('/api/geocode/?query=${query || ""}')

export default class GeocodeModal extends React.Component {
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
        <GeocodeResults query={this.state.query} />
      </Modal>
    )
  }
}

const GeocodeResults = connect(
  withGeocode((props) => {
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
      window.location.hash = ''
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
