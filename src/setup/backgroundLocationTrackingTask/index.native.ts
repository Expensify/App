import type {LocationObject} from 'expo-location';
import {defineTask} from 'expo-task-manager';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import {addGpsPoints, setStartAddress} from '@libs/actions/GPSDraftDetails';
import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import addressFromGpsPoint from '@pages/iou/request/step/IOURequestStepDistanceGPS/utils/addressFromGpsPoint';
import coordinatesToString from '@pages/iou/request/step/IOURequestStepDistanceGPS/utils/coordinatesToString';
import ONYXKEYS from '@src/ONYXKEYS';

type BackgroundLocationTrackingTaskData = {locations: LocationObject[]};

defineTask<BackgroundLocationTrackingTaskData>(BACKGROUND_LOCATION_TRACKING_TASK_NAME, async ({data, error}) => {
    if (error) {
        console.error('[GPS distance request] Long-running task error: ', {error, data});
        return;
    }

    const gpsDraftDetails = await OnyxUtils.get(ONYXKEYS.GPS_DRAFT_DETAILS);

    const currentPoints = gpsDraftDetails?.gpsPoints ?? [];

    if (currentPoints.length === 0) {
        const startPoint = data.locations.at(0);

        if (startPoint) {
            const address = await addressFromGpsPoint({lat: startPoint.coords.latitude, long: startPoint.coords.longitude});

            if (address !== null) {
                setStartAddress({value: address, type: 'address'});
            } else {
                setStartAddress({value: coordinatesToString({lat: startPoint.coords.latitude, long: startPoint.coords.longitude}), type: 'coordinates'});
            }
        }
    }

    const newGpsPoints = data.locations.map((location) => ({lat: location.coords.latitude, long: location.coords.longitude}));

    addGpsPoints(gpsDraftDetails, newGpsPoints);
});
