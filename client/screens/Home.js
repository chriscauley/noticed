import React from 'react'

import gps from '../gps/'
import withLocations from '../location/withLocations'

const LocationList = gps.required(
  withLocations(props => {
    const { loading, locations } = props.api
    if (loading && !locations) {
      return null
    }
    return (
      <div>
        {locations.map(({name, id}) => (
          <div key={id}>{name}</div>
        ))}
      </div>
    )
  })
)

export default () => {
  return (
    <div>
      <LocationList />
      'Woo!!!'
    </div>
  )
}
