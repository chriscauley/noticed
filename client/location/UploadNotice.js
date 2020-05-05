// TODO DEPRECATED
import React from 'react'
import { post } from '@unrest/core'
import css from '@unrest/css'

import alert from '../alert'

function testSupported(attribute) {
  const i = document.createElement('input')
  i.setAttribute(attribute, true)
  return !!i[attribute]
}

const captureSupported = testSupported('capture') || true

class UploadNotice extends React.Component {
  state = {}
  onChange = ({ target }) => {
    const files = target.files
    const { location_id, notice_id, onSuccess } = this.props
    if (!FileReader) {
      // TODO fallback a warning for older browsers
      return
    }

    if (files && files.length) {
      const reader = new FileReader()
      reader.onload = () => {
        const filename = target.value.split(/[\\/]/).pop()
        const src = reader.result.replace(/;/, `;name=${filename};`)
        this.setState({ loading: true })
        post('/api/location/noticephoto/', {
          src,
          location_id,
          notice_id,
        }).then(({ error }) => {
          this.setState({ loading: false })
          if (error) {
            this.props.alert.error(error)
          } else {
            const m =
              'Notice added! Since you uploaded this notice you can delete it.'
            this.props.alert.success(m)
            onSuccess()
          }
        })
      }
      reader.readAsDataURL(files[0])
    }
  }

  render() {
    return (
      <>
        <div className="mb-8">
          {`Upload a photo ${
            captureSupported ? 'from camera or device' : ''
          } to add a notice.`}
        </div>
        <div className="text-xl">
          {captureSupported && (
            <label className={css.button.primary('mr-4')}>
              <i className={css.icon('camera')} />
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={this.onChange}
                capture
              />
            </label>
          )}
          <label className={css.button.primary()}>
            <i className={css.icon('folder-open')} />
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={this.onChange}
            />
          </label>
        </div>
      </>
    )
  }
}

export default alert.connect(UploadNotice)
