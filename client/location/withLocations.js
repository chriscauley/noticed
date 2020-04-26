import RestHook from '@unrest/react-rest-hook'

export default RestHook(
  '/api/location/location?latlon=${gps.latitude},${gps.longitude}',
)
