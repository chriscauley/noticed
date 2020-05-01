import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'
import connect from './connect'

class BaseNavLink extends React.Component {
  state = {}
  _toggle = (callback) => () => {
    this.toggle()
    callback()
  }
  // toggle = () => this.setState({ open: !this.state.open })
  toggle = () => (window.location.hash = '#/gps/search/')

  render() {
    const { gps } = this.props
    return (
      <div className={css.dropdown.outer()}>
        <div
          className={css.dropdown.toggle('flex items-center')}
          onClick={this.toggle}
        >
          <i className="fa fa-map-marker mr-2" />
          <div className="max-w-10 md:max-w-16 truncate">
            {gps.source ? gps.display : '?'}
            {gps.loading || ''}
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
          {gps.source && (
            <>
              <div className="border-b border-t mt-1 pb-1" />
              <Link
                to="/gps/map/"
                className={css.dropdown.item()}
                onClick={this.toggle}
              >
                View Info
              </Link>
              <div
                className={css.dropdown.item()}
                onClick={this._toggle(() => gps.actions.save(null))}
              >
                Clear
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
}

export default connect(BaseNavLink)
