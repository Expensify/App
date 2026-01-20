function coordinatesToString(gpsPoint: {lat: number; long: number}): string {
    return `${gpsPoint.lat},${gpsPoint.long}`;
}

export default coordinatesToString;
