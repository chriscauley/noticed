import React from 'react'
import connect from './connect'
import css from '@unrest/css'
import { formatDistanceToNowStrict } from 'date-fns'

export default connect((props) => {
  const { gps } = props
  if (!gps.source) {
    return 'No GPS Coordinates set'
  }
  const latlon = `${gps.latitude.toFixed(6)},${gps.longitude.toFixed(6)}`
  const url = 'https://maps.googleapis.com/maps/api/staticmap?'
  const params =
    'zoom=16&size=400x400&key=AIzaSyAQDgeeUI0TbWvr5yi8CtBfSF2YjJb8jRs'
  const query = `&center=${latlon}&markers=${latlon}`
  const rows = [
    ['Current', gps.display],
    ['Source', gps.source],
    ['Coordinates', latlon],
    ['Updated', gps.count + ' times'],
  ]
  gps.updated &&
    rows.push(['Last Update', formatDistanceToNowStrict(gps.updated)])
  gps.checked &&
    rows.push(['Last Check', formatDistanceToNowStrict(gps.checked)])
  return (
    <div>
      <div className={css.h2()}>Current GPS Status</div>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2">
          {rows.map((row) => (
            <div key={row[0]}>
              <span className="bold">{row[0]}</span>: {row[1]}
            </div>
          ))}
        </div>
        <div className="w-full sm:w-1/2">
          <img src={url + params + query} />
        </div>
      </div>
    </div>
  )
})
