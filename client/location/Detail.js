import React from 'react'
import RestHook from '@unrest/react-rest-hook'
import { post } from '@unrest/react-jsonschema-form'
import css from '@unrest/css'

const withLocation = RestHook(
  '/api/location/location/${match.params.location_id}/',
)

function testSupported(attribute) {
  const i = document.createElement('input')
  i.setAttribute(attribute, true)
  return !!i[attribute]
}

const captureSupported = testSupported('capture')
const icon = (i) =>
  'rounded-full text-white text-3xl m-2 cursor-pointer w-16 h-16 items-center justify-center fa flex fa-' +
  i

class UploadNotice extends React.Component {
  state = {}
  constructor(props) {
    super(props)
    this.camera = React.createRef()
    this.files = React.createRef()
  }

  onChange = (ref) => () => {
    const files = ref.current.files
    if (!FileReader) {
      // TODO fallback a warning for older browsers
      return
    }

    if (files && files.length) {
      const reader = new FileReader()
      reader.onload = () => {
        const filename = ref.current.value.split(/[\\/]/).pop()
        const src = reader.result.replace(/;/, `;name=${filename};`)
        this.setState({ src })
      }
      reader.readAsDataURL(files[0])
    }
  }

  confirm = () => {
    this.setState({ loading: true })
    const { location_id, notice_id, onSuccess } = this.props
    const { src } = this.state
    post('/api/location/noticephoto/', { src, location_id, notice_id }).then(
      () => {
        this.setState({ src: null })
        onSuccess()
      },
    )
  }

  cancel = () => this.setState({ src: null })

  render() {
    if (this.state.src) {
      return (
        <div className={css.modal.outer()}>
          <div className={css.modal.mask()} onClick={this.cancel}></div>
          <div className={css.modal.content('flex flex-col')}>
            <div className="overflow-y-scroll">
              <img src={this.state.src} />
            </div>
            <div className="text-3xl flex items-center justify-center bg-white">
              <div>Does this look right?</div>
              <i className={icon('close bg-red-500')} onClick={this.cancel} />
              <i
                className={icon('check bg-green-500')}
                onClick={this.confirm}
              />
            </div>
          </div>
        </div>
      )
    }
    return (
      <>
        {captureSupported && (
          <label className={css.button.primary()}>
            Take Camera Picture
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={this.onChange(this.camera)}
              ref={this.camera}
              capture
            />
          </label>
        )}
        <label className={css.button.primary()}>
          Upload Picture from Device
          <input
            className="hidden"
            type="file"
            accept="image/*"
            onChange={this.onChange(this.files)}
            ref={this.files}
          />
        </label>
      </>
    )
  }
}

export default withLocation((props) => {
  const { loading, location, refetch } = props.api
  if (loading && !location) {
    return null
  }
  return (
    <div>
      <h2 className={css.h2()}>{location.name}</h2>
      <div>This place has {location.notice_count} notices.</div>
      {location.public_notices.map(({ src }) => (
        <div key={src}>
          <img src={src} />
        </div>
      ))}
      <UploadNotice
        location_id={location.id}
        onSuccess={() => refetch(props)}
      />
    </div>
  )
})