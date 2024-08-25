function getBounds(waypoints: Array<[number, number]>, directionCoordinates: undefined | Array<[number, number]>): {southWest: [number, number]; northEast: [number, number]} {
    const lngs = waypoints.map((waypoint) => waypoint[0]);
    const lats = waypoints.map((waypoint) => waypoint[1]);
    if (directionCoordinates) {
        lngs.push(...directionCoordinates.map((coordinate) => coordinate[0]));
        lats.push(...directionCoordinates.map((coordinate) => coordinate[1]));
    }

    return {
        southWest: [Math.min(...lngs), Math.min(...lats)],
        northEast: [Math.max(...lngs), Math.max(...lats)],
    };
}

/**
 * Calculates the distance between two points on the Earth's surface given their latitude and longitude coordinates.
 */
function haversineDistance(coordinate1: number[], coordinate2: number[]) {
    // Radius of the Earth in meters
    const R = 6371e3;
    const lat1 = ((coordinate1.at(0) ?? 0) * Math.PI) / 180;
    const lat2 = ((coordinate2.at(0) ?? 0) * Math.PI) / 180;
    const deltaLat = (((coordinate2.at(0) ?? 0) - (coordinate1.at(0) ?? 0)) * Math.PI) / 180;
    const deltaLon = (((coordinate2.at(1) ?? 0) - (coordinate1.at(1) ?? 0)) * Math.PI) / 180;

    // The square of half the chord length between the points
    const halfChordLengthSq = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    // The angular distance in radians
    const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLengthSq), Math.sqrt(1 - halfChordLengthSq));

    // Distance in meters
    return R * angularDistance;
}

function areSameCoordinate(coordinate1: number[], coordinate2: number[]) {
    return haversineDistance(coordinate1, coordinate2) < 20;
}

export default {
    getBounds,
    areSameCoordinate,
};
