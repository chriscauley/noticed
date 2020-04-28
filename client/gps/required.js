import React from 'react'

import connect from './connect'
import GeocodeModal from './GeocodeModal'

export default function GPSRequired(Component) {
  return connect((props) => {
    const { gps } = props
    return gps.source ? <Component {...props} /> : <GeocodeModal {...props} />
  })
}
