import type {GPSPoint, TrimmedGPSPoint} from '@src/types/onyx/GpsDraftDetails';
import geodesicDistance from '@src/utils/geodesicDistance';

import {reverseGeocodeAsync} from 'expo-location';

/**
 * Point level helpers for GPS distance requests. These live outside GPSDraftDetailsUtils so that
 * actions/GPSDraftDetails can use them without importing GPSDraftDetailsUtils, which imports the action
 * module back and would close an import cycle.
 */
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

function calculateTrimmedEndPoint(gpsPoints: GPSPoint[][], targetDistanceMeters: number): TrimmedGPSPoint | null {
    let distanceTraveled = 0;

    for (let segmentIndex = 0; segmentIndex < gpsPoints.length; segmentIndex++) {
        const segment = gpsPoints.at(segmentIndex);

        if (!segment) {
            continue;
        }

        for (let pointIndex = 1; pointIndex < segment.length; pointIndex++) {
            const previousPoint = segment.at(pointIndex - 1);
            const currentPoint = segment.at(pointIndex);

            if (!previousPoint || !currentPoint) {
                continue;
            }
            const distanceBetweenPoints = geodesicDistance(previousPoint, currentPoint);

            if (distanceTraveled + distanceBetweenPoints >= targetDistanceMeters) {
                const fractionToInclude = distanceBetweenPoints === 0 ? 0 : (targetDistanceMeters - distanceTraveled) / distanceBetweenPoints;
                const interpolatedPoint = {
                    lat: previousPoint.lat + fractionToInclude * (currentPoint.lat - previousPoint.lat),
                    long: previousPoint.long + fractionToInclude * (currentPoint.long - previousPoint.long),
                };

                return {...interpolatedPoint, segmentIndex, precedingPointIndex: pointIndex - 1};
            }

            distanceTraveled += distanceBetweenPoints;
        }
    }

    return null;
}

export {addressFromGpsPoint, coordinatesToString, calculateTrimmedEndPoint};
