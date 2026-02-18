type GPSPoint = {lat: number; long: number};

function degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * The Earth radius in meters. The {@link https://en.wikipedia.org/wiki/Earth_radius#Arithmetic_mean_radius mean radius}
 * was selected because it is {@link https://rosettacode.org/wiki/Haversine_formula#:~:text=This%20value%20is%20recommended recommended }
 * by the Haversine formula to reduce error.
 */
const EARTH_RADIUS = 6371008.8;

/**
 * Calculates the distance between two GPS coordinates using
 * {@link https://en.wikipedia.org/wiki/Haversine_formula Haversine formula}
 * @returns distance in meters
 */
function geodesicDistance({lat: lat1, long: long1}: GPSPoint, {lat: lat2, long: long2}: GPSPoint) {
    const dLat = degreesToRadians(lat1 - lat2);
    const dLong = degreesToRadians(long1 - long2);
    const lat1Radians = degreesToRadians(lat1);
    const lat2Radians = degreesToRadians(lat2);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Radians) * Math.cos(lat2Radians) * Math.sin(dLong / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS * c;

    return distance;
}

export default geodesicDistance;
