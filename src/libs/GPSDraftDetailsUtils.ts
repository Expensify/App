import {reverseGeocodeAsync} from 'expo-location';
import type {GpsDraftDetails} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type {Routes, WaypointCollection} from '@src/types/onyx/Transaction';
import DistanceRequestUtils from './DistanceRequestUtils';
import {roundToTwoDecimalPlaces} from './NumberUtils';

function getGPSWaypoints(gpsDraftDetails: GpsDraftDetails | undefined): WaypointCollection {
    const gpsCoordinates = gpsDraftDetails?.gpsPoints ?? [];
    const firstPoint = gpsCoordinates.at(0);
    const lastPoint = gpsCoordinates.at(-1);
    const startAddress = gpsDraftDetails?.startAddress.value ?? '';
    const endAddress = gpsDraftDetails?.endAddress.value ?? '';

    return {
        ...(firstPoint
            ? {
                  waypoint0: {
                      keyForList: 'gps_start', // temporary for hasGPSWaypoints()
                      lat: firstPoint.lat,
                      lng: firstPoint.long,
                      address: startAddress,
                      name: startAddress,
                  },
              }
            : {}),
        ...(lastPoint
            ? {
                  waypoint1: {
                      keyForList: 'gps_stop', // temporary for hasGPSWaypoints()
                      lat: lastPoint.lat,
                      lng: lastPoint.long,
                      address: endAddress,
                      name: endAddress,
                  },
              }
            : {}),
    };
}

function getGPSRoutes(gpsDraftDetails: GpsDraftDetails | undefined): Routes {
    const distanceInMeters = roundToTwoDecimalPlaces(gpsDraftDetails?.distanceInMeters ?? 0);
    const gpsCoordinates = gpsDraftDetails?.gpsPoints ?? [];

    return {
        route0: {
            distance: distanceInMeters,
            geometry: {
                type: 'LineString',
                coordinates: gpsCoordinates.map(({lat, long}) => [long, lat]),
            },
        },
    };
}

function getGPSCoordinates(gpsDraftDetails: GpsDraftDetails | undefined): string | undefined {
    return gpsDraftDetails?.gpsPoints ? JSON.stringify(gpsDraftDetails.gpsPoints.map((val) => ({lng: val.long, lat: val.lat}))) : undefined;
}

function calculateGPSDistance(distanceInMeters: number, unit: Unit): number {
    return DistanceRequestUtils.convertDistanceUnit(distanceInMeters, unit);
}

function getGPSConvertedDistance(gpsDraftDetails: GpsDraftDetails | undefined, unit: Unit): number {
    const distanceInMeters = gpsDraftDetails?.distanceInMeters ?? 0;
    return calculateGPSDistance(distanceInMeters, unit);
}

async function addressFromGpsPoint(gpsPoint: {lat: number; long: number}): Promise<string | null> {
    try {
        const [location] = await reverseGeocodeAsync({latitude: gpsPoint.lat, longitude: gpsPoint.long});

        if (!location) {
            return null;
        }

        const address: string = location?.formattedAddress ?? [location?.name, location?.city, location?.region].filter(Boolean).join(', ');

        return address;
    } catch (error) {
        console.error('[GPS distance request] Failed to reverse geocode location to postal address: ', error);
        return null;
    }
}

function coordinatesToString(gpsPoint: {lat: number; long: number}): string {
    return `${gpsPoint.lat},${gpsPoint.long}`;
}

export {getGPSRoutes, getGPSWaypoints, getGPSConvertedDistance, getGPSCoordinates, addressFromGpsPoint, coordinatesToString, calculateGPSDistance};
