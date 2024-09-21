import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {UserLocation} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

/**
 * Construct the rectangular boundary based on user location and waypoints
 */
export default function useLocationBias(allWaypoints: WaypointCollection, userLocation?: OnyxEntry<UserLocation>) {
    return useMemo(() => {
        const hasFilledWaypointCount = Object.values(allWaypoints).some((waypoint) => Object.keys(waypoint).length > 0);
        // If there are no filled wayPoints and if user's current location cannot be retrieved,
        // it is futile to arrive at a biased location. Let's return
        if (!hasFilledWaypointCount && userLocation === undefined) {
            return undefined;
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
            longitudes.push(userLocation?.longitude ?? 0);
            latitudes.push(userLocation?.latitude ?? 0);
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

        if(latitudes.length === 0 || longitudes.length === 0) {
            return undefined;
        }
        const rectangularBoundary = {
            rectangle: {
                low: {
                    latitude: south,
                    longitude: west,
                },
                high: {
                    latitude: north,
                    longitude: east,
                }
            }
        };
        return rectangularBoundary;
    }, [userLocation, allWaypoints]);
}
