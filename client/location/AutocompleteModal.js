import React from 'react'
import { withRouter } from 'react-router-dom'
import css from '@unrest/css'
import { debounce } from 'lodash'
import auth from '@unrest/react-auth'
import Form, { post } from '@unrest/react-jsonschema-form'
import RestHook from '@unrest/react-rest-hook'
import alert from '../alert'
import gps from '../gps'

import Modal from '../components/Modal'

const withAutocomplete = RestHook(
  '/api/autocomplete/?query=${query}&location=${gps.latlon}',
)

const RecentLocations = auth.withAuth((props) => {
  const { loading, user } = props.auth
  if (loading || !user) {
    return null
  }
  return (
    <div>
      <div className={css.list.outer()}>
        {user.recent_locations.slice(0, 5).map((location) => (
          <div
            className={css.list.action()}
            key={location.id}
            onClick={() => props.selectLocation({ location_id: location.id })}
          >
            <div>{location.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
})

class AutocompleteModal extends React.Component {
  state = {}
  onSubmit = (formData) => this.setState(formData)
  onChange = debounce((formData) => this.setState(formData), 2000)
  render() {
    const { photo_id } = this.props.match.params
    const alert = this.props.alert
    const selectLocation = (data) =>
      post('/api/media/photo/locate/', { photo_id, ...data }).then(
        ({ error }) => {
          error ? alert.error(error) : alert.success('Photo located')
          this.props.auth.refetch()
          window.location.hash = ''
        },
      )

    const schema = {
      type: 'object',
      title: 'Location Search',
      properties: {
        query: { type: 'string', title: 'Business name' },
      },
      required: ['query'],
    }

    return (
      <Modal>
        <Form
          schema={schema}
          onSubmit={this.onSubmit}
          onChange={this.onChange}
        />
        {this.state.query ? (
          <AutocompleteResults
            query={this.state.query}
            selectLocation={selectLocation}
          />
        ) : (
          <RecentLocations selectLocation={selectLocation} />
        )}
      </Modal>
    )
  }
}

export default auth.withAuth(withRouter(alert.connect(AutocompleteModal)))
let last_predictions = []

const AutocompleteResults = gps.connect(
  withAutocomplete((props) => {
    const { loading, predictions = last_predictions } = props.api
    if (loading && !predictions.length) {
      return null
    }
    last_predictions = predictions
    return (
      <div className={css.list.outer()}>
        {predictions.map(({ structured_formatting, place_id }) => (
          <div
            className={css.list.action()}
            key={place_id}
            onClick={() => props.selectLocation({ place_id })}
          >
            <div>
              {structured_formatting.main_text}
              <div className={'text-sm text-gray-600'}>
                {structured_formatting.secondary_text}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }),
)
