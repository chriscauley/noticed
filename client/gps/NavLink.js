import React from 'react'
import css from '@unrest/css'
import connect from './connect'

class BaseNavLink extends React.Component {
  state = {}
  _toggle = (callback) => () => {
    this.toggle()
    callback()
  }
  toggle = () => this.setState({ open: !this.state.open })

  render() {
    const { gps } = this.props
    return (
      <div className={css.dropdown.outer()}>
        <div
          className={css.dropdown.toggle('flex items-center')}
          onClick={this.toggle}
        >
          <i className="fa fa-map-marker mr-2" />
          <div
            className="hidden md:inline-block truncate"
            style={{ maxWidth: '12rem' }}
          >
            {gps.source ? gps.display : '???'}
          </div>
        </div>
        <div
          className={css.dropdown.shelf(this.state.open ? 'block' : 'hidden')}
          style={{ minWidth: 180 }}
        >
          <div
            className={css.dropdown.item()}
            onClick={this._toggle(gps.actions.useGPS)}
          >
            Current Location
          </div>
          <a
            href="#/gps/search/"
            className={css.dropdown.item()}
            onClick={this.toggle}
          >
            Search
          </a>
          <div
            className={css.dropdown.item()}
            onClick={this._toggle(() => gps.actions.save(null))}
          >
            Clear
          </div>
        </div>
      </div>
    )
  }
}

export default connect(BaseNavLink)
