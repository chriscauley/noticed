import React from 'react'
import qs from 'query-string'

export default ({ latlon, size }) => {
  const url = 'https://maps.googleapis.com/maps/api/staticmap?'
  const query = qs.stringify({
    zoom: 16,
    key: 'AIzaSyAQDgeeUI0TbWvr5yi8CtBfSF2YjJb8jRs',
    size,
    center: latlon,
    markers: latlon,
  })
  return <img src={url + query} />
}
