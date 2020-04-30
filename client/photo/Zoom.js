import React from 'react'
import css from '@unrest/css'

export const ZoomButton = (props) => (
  <a
    href={`#/photo/zoom/${encodeURIComponent(props.src)}/`}
    className={css.button()}
  >
    <i className={css.icon('search-plus')} />
  </a>
)

const style = {
  big: { maxHeight: 'unset', maxWidth: 'unset', cursor: 'zoom-out' },
  small: { maxHeight: '100vh', maxWidth: '100vw', cursor: 'zoom-in' },
}

export default class Zoom extends React.Component {
  state = {}
  toggle = () => this.setState({ zoomed: !this.state.zoomed })
  render() {
    const src = decodeURIComponent(this.props.match.params.src)
    const img_style = style[this.state.zoomed ? 'big' : 'small']

    return (
      <div className={css.modal.outer()}>
        <a className={css.modal.mask()} href="#" />
        <div className={css.modal.content.fullscreen()}>
          <img src={src} style={img_style} onClick={this.toggle} />
        </div>
      </div>
    )
  }
}
