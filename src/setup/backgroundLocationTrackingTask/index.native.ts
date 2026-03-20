import NetInfo from '@react-native-community/netinfo';
import type {LocationObject} from 'expo-location';
import {defineTask} from 'expo-task-manager';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import {addGpsPoints, setStartAddress} from '@libs/actions/GPSDraftDetails';
import {addressFromGpsPoint, coordinatesToString} from '@libs/GPSDraftDetailsUtils';
import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';

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

    updateStartAddress(gpsDraftDetails?.gpsPoints ?? [], data.locations.at(0), isOffline);

    const newGpsPoints = data.locations.map((location) => ({lat: location.coords.latitude, long: location.coords.longitude}));

    addGpsPoints(gpsDraftDetails, newGpsPoints);
});

async function updateStartAddress(currentGpsPoints: GpsDraftDetails['gpsPoints'], startPoint: LocationObject | undefined, isOffline: boolean) {
    if (currentGpsPoints.length !== 0 || !startPoint) {
        return;
    }

    if (!isOffline) {
        const address = await addressFromGpsPoint({lat: startPoint.coords.latitude, long: startPoint.coords.longitude});

        if (address !== null) {
            setStartAddress({value: address, type: 'address'});
            return;
        }
    }

    setStartAddress({value: coordinatesToString({lat: startPoint.coords.latitude, long: startPoint.coords.longitude}), type: 'coordinates'});
}
