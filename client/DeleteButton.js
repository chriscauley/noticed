import React from 'react'
import css from '@unrest/css'

import Spindown from './spindown'
import alert from './alert'

class BaseDeleteButton extends React.Component {
  state = {}
  componentWillUnmount = () => clearTimeout(this.state.timeout)
  onClick = () => {
    clearTimeout(this.state.timeout)
    if (this.state.clicked) {
      this.props.action().then((result) => {
        const { alert, onDelete = () => {}, name = 'Item' } = this.props
        if (result.error) {
          alert.error(result.error)
        } else {
          alert.success(`${name} has been deleted.`)
          onDelete(result)
        }
      })
    }
    return this.setState({
      clicked: true,
      timeout: setTimeout(() => this.setState({ clicked: false }), 2000),
    })
  }
  getContent() {
    if (this.state.clicked) {
      return (
        <div className="flex" style={{ fontSize: 25 }}>
          <Spindown size="1.5em" className="mr-2" duration={2} />
          Are you sure?
        </div>
      )
    }
    return <i className="fa fa-trash" />
  }
  render() {
    return (
      <button
        className={css.button.danger('absolute top-0 right-0 m-4')}
        onClick={this.onClick}
      >
        {this.getContent()}
      </button>
    )
  }
}

export default alert.connect(BaseDeleteButton)
