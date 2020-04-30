import React from 'react'
import connect from './connect'
import css from '@unrest/css'
import { formatDistanceToNowStrict } from 'date-fns'
import * as gs from 'react-static-google-map'

export default connect((props) => {
  const { gps } = props
  if (!gps.source) {
    return 'No GPS Coordinates set'
  }
  const latlon = `${gps.latitude.toFixed(5)},${gps.longitude.toFixed(5)}`
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
          <gs.StaticGoogleMap
            size="400x400"
            apiKey="AIzaSyAQDgeeUI0TbWvr5yi8CtBfSF2YjJb8jRs"
          >
            <gs.Marker location={latlon} color="blue" />
          </gs.StaticGoogleMap>
        </div>
      </div>
    </div>
  )
})
