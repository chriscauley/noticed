import React from 'react'
import { debounce } from 'lodash'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import css from '@unrest/css'
import auth from '@unrest/react-auth'
import RestHook from '@unrest/react-rest-hook'
import { post } from '@unrest/react-jsonschema-form'

import DeleteButton from '../DeleteButton'

const ref = React.createRef(null)
const withCrops = RestHook('/api/media/photo/${match.params.photo_id}/crops/')

const CropCard = (props) => {
  const { url, id, onDelete, owner } = props
  const _delete = () => post('/api/media/photocrop/delete/', { id })
  return (
    <div className="relative">
      {owner && (
        <div className="absolute top-0 right-0 m-4">
          <DeleteButton
            action={_delete}
            onDelete={onDelete}
            name="Photo Crop"
          />
        </div>
      )}
      <img src={url} />
    </div>
  )
}

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
    const { user } = this.props.auth
    const photo_id = parseInt(this.props.match.params.photo_id)
    const photo = user.photos.find((p) => p.id === photo_id)
    const { crops = [], refetch } = this.props.api
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
            <CropCard
              {...crop}
              key={crop.url}
              onDelete={() => refetch(this.props)}
              owner={!!user.photos.find((p) => p.id === photo_id)}
            />
          ))}
        </div>
        <div className="w-2/3 px-2 relative">
          <Cropper
            ref={ref}
            src={photo.src}
            style={{ height: '90%', width: '100%' }}
            crop={this.crop}
          />
          <div className="absolute top-0 right-0 m-4">
            <button className={css.button()} onClick={this.addCrop}>
              Crop it up
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default auth.required(withCrops(CropEditor))
