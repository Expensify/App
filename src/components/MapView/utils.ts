import type {LngLat} from 'react-map-gl';
import type {Coordinate} from './MapViewTypes';

function getBounds(waypoints: Coordinate[], directionCoordinates: undefined | Coordinate[]): {southWest: Coordinate; northEast: Coordinate} {
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
function haversineDistance(coordinate1: Coordinate, coordinate2: Coordinate) {
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

function areSameCoordinate(coordinate1: Coordinate, coordinate2: Coordinate) {
    return haversineDistance(coordinate1, coordinate2) < 20;
}

function findClosestCoordinateOnLineFromCenter(center: LngLat, lineCoordinates: Coordinate[]): Coordinate | null {
    if (!lineCoordinates || lineCoordinates.length < 2) {
        return null;
    }

    let closestPointOnLine: Coordinate | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < lineCoordinates.length - 1; i++) {
        const startPoint = lineCoordinates.at(i);
        const endPoint = lineCoordinates.at(i + 1);

        if (!startPoint || !endPoint) {
            break;
        }

        const closestPoint = closestPointOnSegment(center, startPoint, endPoint);

        const distance = haversineDistance([center.lng, center.lat], [closestPoint.lng, closestPoint.lat]);

        if (distance < minDistance) {
            minDistance = distance;
            closestPointOnLine = [closestPoint.lng, closestPoint.lat];
        }
    }

    return closestPointOnLine;
}

/**
 * Find the closest point on the line segment created by connecting start and endPoint
 */
function closestPointOnSegment(point: LngLat, startPoint: Coordinate, endPoint: Coordinate): LngLat {
    const x0 = point.lng;
    const y0 = point.lat;
    const x1 = startPoint[0];
    const y1 = startPoint[1];
    const x2 = endPoint[0];
    const y2 = endPoint[1];

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
        return {lng: x1, lat: y1};
    }

    const t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy);

    let closestX;
    let closestY;
    if (t < 0) {
        closestX = x1;
        closestY = y1;
    } else if (t > 1) {
        closestX = x2;
        closestY = y2;
    } else {
        closestX = x1 + t * dx;
        closestY = y1 + t * dy;
    }

    return {lng: closestX, lat: closestY};
}

function getBoundsCenter(bounds: {southWest: Coordinate; northEast: Coordinate}) {
    const {
        southWest: [south, west],
        northEast: [north, east],
    } = bounds;

    const latitudeCenter = (north + south) / 2;
    const longitudeCenter = (east + west) / 2;

    return {lng: latitudeCenter, lat: longitudeCenter};
}

export default {
    getBounds,
    areSameCoordinate,
    findClosestCoordinateOnLineFromCenter,
    getBoundsCenter,
};
