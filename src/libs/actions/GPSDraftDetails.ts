import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {GPS_DISTANCE_INTERVAL_METERS} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {updateGpsTripNotificationDistance} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';
import type {GPSPoint, GPSPointAddress} from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';
import geodesicDistance from '@src/utils/geodesicDistance';
import {setUserLocation} from './UserLocation';

function resetGPSDraftDetails() {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, null);
}

function getGpsPoints(gpsDraftDetails: GpsDraftDetails | undefined): GPSPoint[][] {
    return gpsDraftDetails?.gpsPoints ?? [[]];
}

function setStartWaypointAddress(startAddress: GPSPointAddress, tripSegmentIndex: number, gpsPoints: GPSPoint[][]) {
    const tripSegment = gpsPoints.at(tripSegmentIndex);
    const segmentFirstPoint = tripSegment?.at(0);

    if (!segmentFirstPoint || !tripSegment) {
        return;
    }

    const newSegment = [{...segmentFirstPoint, address: startAddress}, ...tripSegment.slice(1)];
    const newGpsPoints = [...gpsPoints];
    newGpsPoints.splice(tripSegmentIndex, 1, newSegment);

    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: newGpsPoints,
    });
}

function setEndWaypointAddress(endAddress: GPSPointAddress, gpsPoints: GPSPoint[][], tripSegmentIndex = -1) {
    const tripSegment = gpsPoints.at(tripSegmentIndex);
    const segmentLastPoint = tripSegment?.at(-1);

    if (!segmentLastPoint || !tripSegment) {
        return;
    }

    const newSegment = [...tripSegment.slice(0, -1), {...segmentLastPoint, address: endAddress}];
    const newGpsPoints = [...gpsPoints];
    newGpsPoints.splice(tripSegmentIndex, 1, newSegment);

    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: newGpsPoints,
    });
}

function updateGpsPoints(gpsPoints: GPSPoint[][]) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints,
    });
}

function removeLastSegment(gpsPoints: GPSPoint[][]) {
    const newGpsPoints = [...gpsPoints];
    newGpsPoints.pop();

    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: newGpsPoints,
    });
}

function initGpsDraft(reportID: string, unit: Unit) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: [[]],
        isTracking: true,
        distanceInMeters: 0,
        reportID,
        unit,
    });
}

function resumeGpsTrip(gpsDraftDetails: OnyxEntry<GpsDraftDetails>) {
    if (!gpsDraftDetails) {
        return;
    }

    const lastTripSegment = gpsDraftDetails.gpsPoints.at(-1);
    const newGpsPoints = [...gpsDraftDetails.gpsPoints];

    if (lastTripSegment && lastTripSegment.length !== 0) {
        newGpsPoints.push([]);
    }

    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: newGpsPoints,
        isTracking: true,
    });
}

function setIsTracking(isTracking: boolean) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        isTracking,
    });
}

/**
 * Adds new GPS points to the captured points and updates the start address if the last segment is empty
 */
function addGpsPoints(gpsDraftDetails: OnyxEntry<GpsDraftDetails>, newGpsPoints: GPSPoint[]): GPSPoint[][] {
    const capturedPoints = getGpsPoints(gpsDraftDetails);
    const lastTripSegment = capturedPoints.at(-1);

    if (!lastTripSegment) {
        return capturedPoints;
    }

    let previousPoint: GPSPoint | undefined = lastTripSegment.at(-1);
    let distanceToAdd = 0;
    const gpsPointsToAdd: GPSPoint[] = [];

    for (const point of newGpsPoints) {
        if (!previousPoint) {
            previousPoint = point;
            gpsPointsToAdd.push(point);
            continue;
        }

        const distanceBetweenPoints = geodesicDistance(point, previousPoint);

        if (distanceBetweenPoints >= GPS_DISTANCE_INTERVAL_METERS) {
            distanceToAdd += distanceBetweenPoints;
            previousPoint = point;
            gpsPointsToAdd.push(point);
        }
    }

    const capturedDistance = gpsDraftDetails?.distanceInMeters ?? 0;

    const updatedDistance = capturedDistance + distanceToAdd;

    const newCapturedPoints = [...capturedPoints];
    newCapturedPoints.splice(newCapturedPoints.length - 1, 1, [...lastTripSegment, ...gpsPointsToAdd]);

    const latestPoint = newCapturedPoints.at(-1)?.at(-1);

    if (latestPoint) {
        setUserLocation({longitude: latestPoint.long, latitude: latestPoint.lat});
    }

    if (updatedDistance > 0) {
        updateGpsTripNotificationDistance(updatedDistance);
    }

    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: newCapturedPoints,
        distanceInMeters: updatedDistance,
    });

    return newCapturedPoints;
}

export {resetGPSDraftDetails, initGpsDraft, setStartWaypointAddress, setEndWaypointAddress, addGpsPoints, setIsTracking, resumeGpsTrip, removeLastSegment, updateGpsPoints};
