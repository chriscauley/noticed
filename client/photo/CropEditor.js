import React from 'react'
import { debounce } from 'lodash'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import css from '@unrest/css'
import auth from '@unrest/react-auth'
import RestHook from '@unrest/react-rest-hook'
import { post } from '@unrest/react-jsonschema-form'

const ref = React.createRef(null)
const withCrops = RestHook('/api/media/photo/${match.params.photo_id}/crops/')

class CropEditor extends React.Component {
  state = {
    detail: {},
  }

  crop = debounce(({ detail }) => {
    this.setState({ detail })
  }, 500)

  addCrop = () => {
    this.setState({ loading: true })
    // This toDataURL() call can be slow (~1s)
    const { detail } = this.state
    const { photo_id } = this.props.match.params
    post('/api/media/photo/crop/', { ...detail, photo_id })
      .then(() => this.props.api.refetch(this.props))
      .then(() => this.setState({ loading: false }))
  }

  render() {
    const photo_id = parseInt(this.props.match.params.photo_id)
    const { user } = this.props.auth
    const { crops = [] } = this.props.api
    const photo = user.photos.find((p) => p.id === photo_id)
    if (!photo) {
      // TODO
      return (
        <div>
          <h1>404 Error</h1>
          <p>
            Either this photo does not exist or you do not have permission to
            edit it.
          </p>
        </div>
      )
    }
    return (
      <div className="flex -mx-2 h-screen pb-8">
        <div className="w-1/3 px-2 h-full">
          {this.state.loading && <div>Loading...</div>}
          {crops.map((crop) => (
            <div key={crop.url}>
              <img src={crop.url} />
            </div>
          ))}
        </div>
        <div className="w-2/3 px-2">
          <Cropper
            ref={ref}
            src={photo.src}
            style={{ height: '90%', width: '100%' }}
            crop={this.crop}
          />
        </div>
        <div>
          <button className={css.button()} onClick={this.addCrop}>
            Crop it up
          </button>
        </div>
      </div>
    )
  }
}

export default auth.required(withCrops(CropEditor))
