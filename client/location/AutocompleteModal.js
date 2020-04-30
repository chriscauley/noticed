import React from 'react'
import { withRouter } from 'react-router-dom'
import css from '@unrest/css'
import { debounce } from 'lodash'
import Form, { post } from '@unrest/react-jsonschema-form'
import RestHook from '@unrest/react-rest-hook'
import alert from '../alert'

import Modal from '../components/Modal'

const withAutocomplete = RestHook(
  '/api/autocomplete/?query=${query || "Greenline"}',
)

export default class AutocompleteModal extends React.Component {
  state = {}
  onSubmit = (formData) => this.setState(formData)
  onChange = debounce((formData) => this.setState(formData), 2000)
  render() {
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
        <AutocompleteResults query={this.state.query} />
      </Modal>
    )
  }
}

let last_predictions = []

const AutocompleteResults = alert.connect(
  withRouter(
    withAutocomplete((props) => {
      const { loading, predictions = last_predictions } = props.api
      const { photo_id } = props.match.params
      const alert = props.alert
      const selectLocation = (place_id) =>
        post('/api/media/photo/locate/', { photo_id, place_id }).then(
          ({ error }) => {
            error ? alert.error(error) : alert.success('Photo located')
            window.location.hash = ''
          },
        )
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
              onClick={() => selectLocation(place_id)}
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
  ),
)
