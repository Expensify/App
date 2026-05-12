import NetInfo from '@react-native-community/netinfo';
import type {LocationObject} from 'expo-location';
import {defineTask} from 'expo-task-manager';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import {addGpsPoints, setStartWaypointAddress} from '@libs/actions/GPSDraftDetails';
import {addressFromGpsPoint, coordinatesToString, getGpsPoints, getTotalGpsTripPointsInLastSegment} from '@libs/GPSDraftDetailsUtils';
import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';

type BackgroundLocationTrackingTaskData = {locations: LocationObject[]};

defineTask<BackgroundLocationTrackingTaskData>(BACKGROUND_LOCATION_TRACKING_TASK_NAME, async ({data, error}) => {
    if (error) {
        console.error('[GPS distance request] Long-running task error: ', {error, data});
        return;
    }

    // Use NetInfo.fetch() instead of the in-memory NetworkState.isOffline() because this
    // background task may run in a headless JS context (Android) where module-level state
    // in NetworkState.ts hasn't been populated via Onyx/NetInfo subscribers.
    const [gpsDraftDetailsPromiseResult, netInfoState] = await Promise.all([OnyxUtils.get(ONYXKEYS.GPS_DRAFT_DETAILS).catch(() => undefined), NetInfo.fetch()]);
    const gpsDraftDetails = gpsDraftDetailsPromiseResult ?? undefined;
    const isOffline = netInfoState.isConnected === false;

    const newGpsPoints = data.locations.map((location) => ({lat: location.coords.latitude, long: location.coords.longitude}));

    const updatedGpsPoints = addGpsPoints(gpsDraftDetails, newGpsPoints);

    if (shouldUpdateStartAddress(getGpsPoints(gpsDraftDetails), updatedGpsPoints)) {
        updateStartAddress(updatedGpsPoints, isOffline);
    }
});

// Checks if latest update added first point to the current segment
function shouldUpdateStartAddress(gpsPoints: GPSPoint[][], updatedGpsPoints: GPSPoint[][]) {
    return getTotalGpsTripPointsInLastSegment(gpsPoints) === 0 && getTotalGpsTripPointsInLastSegment(updatedGpsPoints) !== 0;
}

async function updateStartAddress(gpsPoints: GPSPoint[][], isOffline: boolean) {
    const startPoint = gpsPoints.at(-1)?.at(0);
    if (!startPoint) {
        return;
    }

    // Get the index of the current (last) segment
    const tripSegmentIndex = gpsPoints.length - 1;

    if (!isOffline) {
        const address = await addressFromGpsPoint({lat: startPoint.lat, long: startPoint.long});

        // To avoid race conditions, we need to get the latest gpsDraftDetails, because reverse geocoding may even take a few seconds
        const gpsDraftDetailsPromiseResult = await OnyxUtils.get(ONYXKEYS.GPS_DRAFT_DETAILS).catch(() => undefined);
        const updatedGpsDraftDetails = gpsDraftDetailsPromiseResult ?? undefined;
        const updatedGpsPoints = updatedGpsDraftDetails ? getGpsPoints(updatedGpsDraftDetails) : gpsPoints;

        if (address !== null) {
            setStartWaypointAddress({value: address, type: 'address'}, tripSegmentIndex, updatedGpsPoints);
        } else {
            setStartWaypointAddress({value: coordinatesToString({lat: startPoint.lat, long: startPoint.long}), type: 'coordinates'}, tripSegmentIndex, updatedGpsPoints);
        }
        return;
    }

    setStartWaypointAddress({value: coordinatesToString({lat: startPoint.lat, long: startPoint.long}), type: 'coordinates'}, tripSegmentIndex, gpsPoints);
}
