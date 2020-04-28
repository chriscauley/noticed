import React from 'react'
import css from '@unrest/css'

import alert from './alert'

class BaseDeleteButton extends React.Component {
  state = {}
  componentWillUnmount = () => clearTimeout(this.state.timeout)
  confirm = () => {
    this.setState({ loading: true })
    this.props.action().then((result) => {
      this.setState({ loading: false, clicked: false })
      const { alert, onDelete = () => {}, name = 'Item' } = this.props
      if (result.error) {
        alert.error(result.error)
      } else {
        alert.success(`${name} has been deleted.`)
        onDelete(result)
      }
    })
  }
  toggle = () => this.setState({ clicked: !this.state.clicked })
  render() {
    return (
      <>
        {this.state.clicked && (
          <div className={css.modal.outer()}>
            <div className={css.modal.mask()} onClick={this.toggle} />
            <div className={css.modal.content.sm()}>
              <div className={css.h3()}>
                Deleting: {this.props.name || 'Item'}
              </div>
              Are you sure?
              <div className="flex justify-between mt-4">
                <button className={css.button.light()} onClick={this.toggle}>
                  No
                </button>
                <button className={css.button()} onClick={this.confirm}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          className={css.button.danger('absolute top-0 right-0 m-4')}
          onClick={this.toggle}
        >
          <i className="fa fa-trash" />
        </button>
      </>
    )
  }
}

export default alert.connect(BaseDeleteButton)
