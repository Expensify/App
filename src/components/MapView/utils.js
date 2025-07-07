"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBounds(waypoints, directionCoordinates) {
    var longitudes = waypoints.map(function (waypoint) { return waypoint[0]; });
    var latitudes = waypoints.map(function (waypoint) { return waypoint[1]; });
    if (directionCoordinates) {
        longitudes.push.apply(longitudes, directionCoordinates.map(function (coordinate) { return coordinate[0]; }));
        latitudes.push.apply(latitudes, directionCoordinates.map(function (coordinate) { return coordinate[1]; }));
    }
    return {
        southWest: [Math.min.apply(Math, longitudes), Math.min.apply(Math, latitudes)],
        northEast: [Math.max.apply(Math, longitudes), Math.max.apply(Math, latitudes)],
    };
}
/**
 * Calculates the distance between two points on the Earth's surface given their latitude and longitude coordinates.
 */
function haversineDistance(coordinate1, coordinate2) {
    var _a, _b, _c, _d, _e, _f;
    // Radius of the Earth in meters
    var R = 6371e3;
    var lat1 = (((_a = coordinate1.at(0)) !== null && _a !== void 0 ? _a : 0) * Math.PI) / 180;
    var lat2 = (((_b = coordinate2.at(0)) !== null && _b !== void 0 ? _b : 0) * Math.PI) / 180;
    var deltaLat = ((((_c = coordinate2.at(0)) !== null && _c !== void 0 ? _c : 0) - ((_d = coordinate1.at(0)) !== null && _d !== void 0 ? _d : 0)) * Math.PI) / 180;
    var deltaLon = ((((_e = coordinate2.at(1)) !== null && _e !== void 0 ? _e : 0) - ((_f = coordinate1.at(1)) !== null && _f !== void 0 ? _f : 0)) * Math.PI) / 180;
    // The square of half the chord length between the points
    var halfChordLengthSq = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    // The angular distance in radians
    var angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLengthSq), Math.sqrt(1 - halfChordLengthSq));
    // Distance in meters
    return R * angularDistance;
}
function areSameCoordinate(coordinate1, coordinate2) {
    return haversineDistance(coordinate1, coordinate2) < 20;
}
function findClosestCoordinateOnLineFromCenter(center, lineCoordinates) {
    if (!lineCoordinates || lineCoordinates.length < 2) {
        return null;
    }
    var closestPointOnLine = null;
    var minDistance = Infinity;
    for (var i = 0; i < lineCoordinates.length - 1; i++) {
        var startPoint = lineCoordinates.at(i);
        var endPoint = lineCoordinates.at(i + 1);
        if (!startPoint || !endPoint) {
            break;
        }
        var closestPoint = closestPointOnSegment(center, startPoint, endPoint);
        var distance = haversineDistance([center.lng, center.lat], [closestPoint.lng, closestPoint.lat]);
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
function closestPointOnSegment(point, startPoint, endPoint) {
    var x0 = point.lng;
    var y0 = point.lat;
    var x1 = startPoint[0];
    var y1 = startPoint[1];
    var x2 = endPoint[0];
    var y2 = endPoint[1];
    var dx = x2 - x1;
    var dy = y2 - y1;
    if (dx === 0 && dy === 0) {
        return { lng: x1, lat: y1 };
    }
    var t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy);
    var closestX;
    var closestY;
    if (t < 0) {
        closestX = x1;
        closestY = y1;
    }
    else if (t > 1) {
        closestX = x2;
        closestY = y2;
    }
    else {
        closestX = x1 + t * dx;
        closestY = y1 + t * dy;
    }
    return { lng: closestX, lat: closestY };
}
function getBoundsCenter(bounds) {
    var _a = bounds.southWest, south = _a[0], west = _a[1], _b = bounds.northEast, north = _b[0], east = _b[1];
    var latitudeCenter = (north + south) / 2;
    var longitudeCenter = (east + west) / 2;
    return { lng: latitudeCenter, lat: longitudeCenter };
}
exports.default = {
    getBounds: getBounds,
    areSameCoordinate: areSameCoordinate,
    findClosestCoordinateOnLineFromCenter: findClosestCoordinateOnLineFromCenter,
    getBoundsCenter: getBoundsCenter,
};
