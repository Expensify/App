import {useMemo} from 'react';

/**
 * Construct the rectangular boundary based on user location and waypoints
 */
export default function useLocationBias(allWaypoints: Record<string, {lng?: number; lat?: number}>, userLocation?: {latitude: number; longitude: number}) {
    return useMemo(() => {
        const hasFilledWaypointCount = Object.values(allWaypoints).some((waypoint) => Object.keys(waypoint).length > 0);
        // If there are no filled wayPoints and if user's current location cannot be retrieved,
        // it is futile to arrive at a biased location. Let's return
        if (!hasFilledWaypointCount && userLocation === undefined) {
            return null;
        }

        // Gather the longitudes and latitudes from filled waypoints.
        const longitudes: number[] = Object.values(allWaypoints).reduce((accum: number[], waypoint) => {
            if (waypoint?.lng) {
                accum.push(waypoint.lng);
            }
            return accum;
        }, []);
        const latitudes: number[] = Object.values(allWaypoints).reduce((accum: number[], waypoint) => {
            if (waypoint?.lat) {
                accum.push(waypoint.lat);
            }
            return accum;
        }, []);

        // When no filled waypoints are available but the current location of the user is available,
        // let us consider the current user's location to construct a rectangular bound
        if (!hasFilledWaypointCount && userLocation !== undefined) {
            longitudes.push(userLocation.longitude);
            latitudes.push(userLocation.latitude);
        }

        // Extend the rectangular bound by 0.5 degree (roughly around 25-30 miles in US)
        const minLat = Math.min(...latitudes) - 0.5;
        const minLng = Math.min(...longitudes) - 0.5;
        const maxLat = Math.max(...latitudes) + 0.5;
        const maxLng = Math.max(...longitudes) + 0.5;

        // Ensuring coordinates do not go out of range.
        const south = minLat > -90 ? minLat : -90;
        const west = minLng > -180 ? minLng : -180;
        const north = maxLat < 90 ? maxLat : 90;
        const east = maxLng < 180 ? maxLng : 180;

        // Format: rectangle:south,west|north,east
        const rectFormat = `rectangle:${south},${west}|${north},${east}`;
        return rectFormat;
    }, [userLocation, allWaypoints]);
}
