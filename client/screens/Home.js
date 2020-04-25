import React from 'react'
import { withLocation } from '../components/Location'

export default withLocation((props) => {
  const { location, saveLocation } = props

  if (!location) {
    const success = (position) => {
      const { latitude, longitude } = position.coords

      saveLocation({ latitude, longitude })
    }
    const error = (e) => console.error(e)
    navigator.geolocation.getCurrentPosition(success, error)
    return <div>We need to know your location!</div>
  }
  const { latitude, longitude } = location

  const href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`
  const text = `Latitude: ${latitude} °, Longitude: ${longitude} °`
  return (
    <div>
      <a href={href}>{text}</a>
      <button onClick={() => saveLocation(null)}>clear location</button>
    </div>
  )
})
