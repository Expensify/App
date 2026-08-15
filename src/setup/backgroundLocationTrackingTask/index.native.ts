import {addGpsPoints, setStartWaypointAddress} from '@libs/actions/GPSDraftDetails';
import {addressFromGpsPoint, coordinatesToString, getGpsPoints, getTotalGpsTripPointsInLastSegment} from '@libs/GPSDraftDetailsUtils';

import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';

import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';

import type {LocationObject} from 'expo-location';
import type {OnyxEntry} from 'react-native-onyx';

import NetInfo from '@react-native-community/netinfo';
import {defineTask} from 'expo-task-manager';
import Onyx from 'react-native-onyx';

type BackgroundLocationTrackingTaskData = {locations: LocationObject[]};

// This is a headless background task (registered via defineTask) that runs outside React, so useOnyx()
// isn't available. GPS_DRAFT_DETAILS is read twice (at task start and again after reverse geocoding), so
// use a short-lived connectWithoutView one-shot read that disconnects as soon as it has the latest value.
function getGpsDraftDetails(): Promise<OnyxEntry<GpsDraftDetails>> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.GPS_DRAFT_DETAILS,
            callback: (gpsDraftDetails: OnyxEntry<GpsDraftDetails>) => {
                Onyx.disconnect(connection);
                resolve(gpsDraftDetails);
            },
        });
    });
}

defineTask<BackgroundLocationTrackingTaskData>(BACKGROUND_LOCATION_TRACKING_TASK_NAME, async ({data, error}) => {
    if (error) {
        console.error('[GPS distance request] Long-running task error: ', {error, data});
        return;
    }

    // Use NetInfo.fetch() instead of the in-memory NetworkState.isOffline() because this
    // background task may run in a headless JS context (Android) where module-level state
    // in NetworkState.ts hasn't been populated via Onyx/NetInfo subscribers.
    const [gpsDraftDetailsPromiseResult, netInfoState] = await Promise.all([getGpsDraftDetails().catch(() => undefined), NetInfo.fetch()]);
    const gpsDraftDetails = gpsDraftDetailsPromiseResult ?? undefined;
    if (!gpsDraftDetails) {
        return;
    }

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
        const gpsDraftDetailsPromiseResult = await getGpsDraftDetails().catch(() => undefined);
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
