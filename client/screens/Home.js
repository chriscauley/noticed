import React from 'react'
import css from '@unrest/css'
import { Link } from 'react-router-dom'
import {cloneDeep} from 'lodash'

import gps from '../gps/'
import withLocations from '../location/withLocations'

css.list = css.CSS({
  outer: 'list-group',
  item: 'list-group-item',
  action: 'list-group-item list-group-item-action',
})


const LocationList = gps.required(
  withLocations(props => {
    const { loading, locations } = props.api
    if (loading && !locations) {
      return null
    }
    return (
      <div className="p-4">
        <div className={css.h3()}>Select a location</div>
        <div className={css.list.outer()}>
          {locations.map(({name, id, notice_count}) => (
            <Link to={`/location/${id}/${slugify(name)}/`} key={id} className={css.list.action()}>
              <div>{name}</div>
              <div>{notice_count}</div>
            </Link>
          ))}
        </div>
      </div>
    )
  })
)

export default () => {
  return (
    <div>
      <LocationList />
    </div>
  )
}
