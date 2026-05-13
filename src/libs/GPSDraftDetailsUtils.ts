import {hasStartedLocationUpdatesAsync, reverseGeocodeAsync, stopLocationUpdatesAsync} from 'expo-location';
import type {SetRequired} from 'type-fest';
import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {stopGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';
import type {GpsDraftDetails} from '@src/types/onyx';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';
import type {Routes, Waypoint} from '@src/types/onyx/Transaction';
import {removeLastSegment, setEndWaypointAddress, setIsTracking} from './actions/GPSDraftDetails';
import DistanceRequestUtils from './DistanceRequestUtils';
import {roundToTwoDecimalPlaces} from './NumberUtils';

type GPSWaypointCollection = Record<string, SetRequired<Waypoint, 'keyForList' | 'lat' | 'lng' | 'address'>>;

function getGPSWaypoint(gpsPoint: GPSPoint, waypointIndex: number): GPSWaypointCollection[string] {
    return {
        keyForList: `gps${waypointIndex}`,
        lat: gpsPoint.lat,
        lng: gpsPoint.long,
        address: gpsPoint.address?.value ?? coordinatesToString(gpsPoint),
    };
}

function getGPSWaypoints(gpsDraftDetails: GpsDraftDetails | undefined): GPSWaypointCollection {
    const gpsCoordinates = getGpsPoints(gpsDraftDetails);

    const waypointCollection: GPSWaypointCollection = {};
    let waypointsCounter = 0;

    for (const segment of gpsCoordinates) {
        const segmentFirstPoint = segment.at(0);
        const segmentLastPoint = segment.at(-1);
        if (!segmentFirstPoint || !segmentLastPoint) {
            continue;
        }

        waypointCollection[`waypoint${waypointsCounter}`] = getGPSWaypoint(segmentFirstPoint, waypointsCounter);
        waypointCollection[`waypoint${waypointsCounter + 1}`] = getGPSWaypoint(segmentLastPoint, waypointsCounter + 1);
        waypointsCounter += 2;
    }

    return waypointCollection;
}

function getGPSRoutes(gpsDraftDetails: GpsDraftDetails | undefined): Routes {
    const distanceInMeters = roundToTwoDecimalPlaces(gpsDraftDetails?.distanceInMeters ?? 0);
    const gpsCoordinates = getGpsPoints(gpsDraftDetails);
    const coordinates: Array<Array<[number, number]>> = gpsCoordinates.map((points) => points.map(({lat, long}) => [long, lat]));

    return {
        route0: {
            distance: distanceInMeters,
            geometry: {
                type: 'LineString',
                coordinates,
            },
        },
    };
}

function getStringifiedGPSCoordinates(gpsDraftDetails: GpsDraftDetails | undefined): string | undefined {
    return gpsDraftDetails?.gpsPoints ? JSON.stringify(gpsDraftDetails.gpsPoints.map((points) => points.map(({lat, long}) => ({lng: long, lat})))) : undefined;
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

function isLastSegmentEmptyOrHasOnlyOnePoint(lastSegment: GPSPoint[]): boolean {
    if (lastSegment.length <= 1) {
        return true;
    }

    return false;
}

async function stopGpsTrip(isOffline: boolean, gpsPoints: GPSPoint[][], skipLastPointAddressFetching = false) {
    const isBackgroundTaskRunning = await hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME);

    if (isBackgroundTaskRunning) {
        await stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));
    }

    setIsTracking(false);
    stopGpsTripNotification();

    const lastSegment = gpsPoints.at(-1);

    if (!lastSegment) {
        return;
    }

    if (isLastSegmentEmptyOrHasOnlyOnePoint(lastSegment) && gpsPoints.length > 1) {
        removeLastSegment(gpsPoints);
        return;
    }

    if (skipLastPointAddressFetching) {
        const lastPoint = lastSegment.at(-1);

        if (!lastPoint) {
            return;
        }

        const formattedCoordinates = coordinatesToString(lastPoint);
        setEndWaypointAddress({value: formattedCoordinates, type: 'coordinates'}, gpsPoints);
        return;
    }

    const lastPoint = lastSegment.at(-1);

    if (!lastPoint) {
        return;
    }

    if (!isOffline) {
        const endAddress = await addressFromGpsPoint(lastPoint);

        if (endAddress !== null) {
            setEndWaypointAddress({value: endAddress, type: 'address'}, gpsPoints);
            return;
        }
    }

    const formattedCoordinates = coordinatesToString(lastPoint);
    setEndWaypointAddress({value: formattedCoordinates, type: 'coordinates'}, gpsPoints);
}

function getTotalGpsTripPoints(gpsDraftDetails: GpsDraftDetails | undefined): number {
    return gpsDraftDetails?.gpsPoints?.flat().length ?? 0;
}

function getTotalGpsTripSegments(gpsDraftDetails: GpsDraftDetails | undefined): number {
    return gpsDraftDetails?.gpsPoints?.length ?? 0;
}

function getTotalGpsTripPointsInLastSegment(gpsPoints: GPSPoint[][]): number {
    return gpsPoints.at(-1)?.length ?? 0;
}

function isTripStopped(gpsDraftDetails: GpsDraftDetails | undefined): boolean {
    return !gpsDraftDetails?.isTracking && getTotalGpsTripPoints(gpsDraftDetails) > 0;
}

function getGpsPoints(gpsDraftDetails: GpsDraftDetails | undefined): GPSPoint[][] {
    return gpsDraftDetails?.gpsPoints ?? [[]];
}

function getFirstGpsPoint(gpsDraftDetails: GpsDraftDetails | undefined): GPSPoint | undefined {
    return gpsDraftDetails?.gpsPoints?.at(0)?.at(0);
}

function getLastGpsPoint(gpsDraftDetails: GpsDraftDetails | undefined): GPSPoint | undefined {
    return gpsDraftDetails?.gpsPoints?.at(-1)?.at(-1);
}

export {
    getGPSRoutes,
    getGPSWaypoints,
    stopGpsTrip,
    getGPSConvertedDistance,
    getStringifiedGPSCoordinates,
    addressFromGpsPoint,
    coordinatesToString,
    calculateGPSDistance,
    isTripStopped,
    getTotalGpsTripPoints,
    getTotalGpsTripSegments,
    getTotalGpsTripPointsInLastSegment,
    getGpsPoints,
    getFirstGpsPoint,
    getLastGpsPoint,
};
