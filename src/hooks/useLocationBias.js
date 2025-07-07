"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useLocationBias;
var react_1 = require("react");
/**
 * Construct the rectangular boundary based on user location and waypoints
 */
function useLocationBias(allWaypoints, userLocation) {
    return (0, react_1.useMemo)(function () {
        var _a, _b;
        var hasFilledWaypointCount = Object.values(allWaypoints).some(function (waypoint) { return Object.keys(waypoint).length > 0; });
        // If there are no filled wayPoints and if user's current location cannot be retrieved,
        // it is futile to arrive at a biased location. Let's return
        if (!hasFilledWaypointCount && userLocation === undefined) {
            return undefined;
        }
        // Gather the longitudes and latitudes from filled waypoints.
        var longitudes = Object.values(allWaypoints).reduce(function (accumulator, waypoint) {
            if (waypoint === null || waypoint === void 0 ? void 0 : waypoint.lng) {
                accumulator.push(waypoint.lng);
            }
            return accumulator;
        }, []);
        var latitudes = Object.values(allWaypoints).reduce(function (accumulator, waypoint) {
            if (waypoint === null || waypoint === void 0 ? void 0 : waypoint.lat) {
                accumulator.push(waypoint.lat);
            }
            return accumulator;
        }, []);
        // When no filled waypoints are available but the current location of the user is available,
        // let us consider the current user's location to construct a rectangular bound
        if (!hasFilledWaypointCount && userLocation !== undefined) {
            longitudes.push((_a = userLocation === null || userLocation === void 0 ? void 0 : userLocation.longitude) !== null && _a !== void 0 ? _a : 0);
            latitudes.push((_b = userLocation === null || userLocation === void 0 ? void 0 : userLocation.latitude) !== null && _b !== void 0 ? _b : 0);
        }
        // Extend the rectangular bound by 0.5 degree (roughly around 25-30 miles in US)
        var minLat = Math.min.apply(Math, latitudes) - 0.5;
        var minLng = Math.min.apply(Math, longitudes) - 0.5;
        var maxLat = Math.max.apply(Math, latitudes) + 0.5;
        var maxLng = Math.max.apply(Math, longitudes) + 0.5;
        // Ensuring coordinates do not go out of range.
        var south = minLat > -90 ? minLat : -90;
        var west = minLng > -180 ? minLng : -180;
        var north = maxLat < 90 ? maxLat : 90;
        var east = maxLng < 180 ? maxLng : 180;
        // Format: rectangle:south,west|north,east
        var rectFormat = "rectangle:".concat(south, ",").concat(west, "|").concat(north, ",").concat(east);
        return rectFormat;
    }, [userLocation, allWaypoints]);
}
