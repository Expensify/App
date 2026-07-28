/** Location coordinates for user */
type UserLocation = Pick<GeolocationCoordinates, 'latitude' | 'longitude'>;

export default UserLocation;
