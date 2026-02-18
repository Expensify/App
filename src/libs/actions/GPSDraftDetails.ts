import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {GPS_DISTANCE_INTERVAL_METERS} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';
import geodesicDistance from '@src/utils/geodesicDistance';

function resetGPSDraftDetails() {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, null);
}

function setStartAddress(startAddress: GpsDraftDetails['startAddress']) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        startAddress,
    });
}

function setEndAddress(endAddress: GpsDraftDetails['endAddress']) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        endAddress,
    });
}

function initGpsDraft(reportID: string) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: [],
        isTracking: true,
        distanceInMeters: 0,
        startAddress: {value: '', type: 'coordinates'},
        endAddress: {value: '', type: 'coordinates'},
        reportID,
    });
}

function setIsTracking(isTracking: boolean) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        isTracking,
    });
}

type GPSPoint = GpsDraftDetails['gpsPoints'][number];

function addGpsPoints(gpsDraftDetails: OnyxEntry<GpsDraftDetails>, newGpsPoints: GpsDraftDetails['gpsPoints']) {
    const capturedPoints = gpsDraftDetails?.gpsPoints ?? [];

    let previousPoint: GPSPoint | undefined = capturedPoints.at(-1);
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

    const updatedGpsPoints = [...capturedPoints, ...gpsPointsToAdd];

    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: updatedGpsPoints,
        distanceInMeters: updatedDistance,
    });
}

export {resetGPSDraftDetails, initGpsDraft, setStartAddress, setEndAddress, addGpsPoints, setIsTracking};
