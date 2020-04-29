import React from 'react'
import { post } from '@unrest/react-jsonschema-form'
import auth from '@unrest/react-auth'
import css from '@unrest/css'

import alert from '../alert'

// TODO copied from UploadNotice
const _onChange = (props) => ({ target }) => {
  const { files = [] } = target
  const { location_id, notice_id, alert } = props
  if (!FileReader) {
    // TODO fallback a warning for older browsers
    return
  }

  Array.from(files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const filename = target.value.split(/[\\/]/).pop()
      const src = reader.result.replace(/;/, `;name=${filename};`)
      post('/api/location/noticephoto/', {
        src,
        location_id,
        notice_id,
      }).then(({ error }) => {
        if (error) {
          alert.error(error)
        } else {
          const m =
            'Notice added! Since you uploaded this notice you can delete it.'
          alert.success(m)
          props.auth.refetch()
        }
      })
    }
    reader.readAsDataURL(file)
  })
}

const Button = auth.withAuth(
  alert.connect((props) => {
    const onChange = _onChange(props)
    return (
      <div className="fixed bottom-0 right-0 m-4 text-2xl z-10">
        <label className={css.button()}>
          <i className={css.icon('file-photo-o')} />
          <input
            className="hidden"
            type="file"
            accept="image/*"
            onChange={onChange}
            multiple
          />
        </label>
      </div>
    )
  }),
)

export default Button
