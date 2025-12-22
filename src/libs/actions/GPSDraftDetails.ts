import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
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

function initGpsDraft() {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: [],
        isTracking: true,
        distanceInMeters: 0,
        startAddress: {value: '', type: 'coordinates'},
        endAddress: {value: '', type: 'coordinates'},
    });
}

function setIsTracking(isTracking: boolean) {
    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        isTracking,
    });
}

type GPSPoint = GpsDraftDetails['gpsPoints'][number];

async function addGpsPoints(gpsPointsToAdd: GpsDraftDetails['gpsPoints']) {
    const gpsDraftDetails = await OnyxUtils.get(ONYXKEYS.GPS_DRAFT_DETAILS);

    const capturedPoints = gpsDraftDetails?.gpsPoints ?? [];

    const pointsToMeasureDistanceBetween: GPSPoint[] = [capturedPoints.at(-1), ...gpsPointsToAdd].filter((val): val is GPSPoint => {
        return !!val;
    });

    let previousPoint: GPSPoint | undefined;
    let distanceToAdd = 0;
    for (const point of pointsToMeasureDistanceBetween) {
        if (previousPoint === undefined) {
            previousPoint = point;
            continue;
        }

        const distanceBetweenPoints = geodesicDistance(point, previousPoint);

        distanceToAdd += distanceBetweenPoints;

        previousPoint = point;
    }

    const capturedDistance = gpsDraftDetails?.distanceInMeters ?? 0;

    const newDistance = capturedDistance + distanceToAdd;

    const newGpsPoints = [...capturedPoints, ...gpsPointsToAdd];

    Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {
        gpsPoints: newGpsPoints,
        distanceInMeters: newDistance,
    });
}

export {resetGPSDraftDetails, initGpsDraft, setStartAddress, setEndAddress, addGpsPoints, setIsTracking};
