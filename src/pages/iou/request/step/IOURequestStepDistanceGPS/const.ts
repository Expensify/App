import {Accuracy} from 'expo-location';
import type {LocationTaskOptions} from 'expo-location';

function getBackgroundLocationTaskOptions(notificationTitle: string, notificationBody: string): LocationTaskOptions {
    return {
        accuracy: Accuracy.Highest,
        distanceInterval: 100,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
            notificationTitle,
            notificationBody,
            killServiceOnDestroy: true,
        },
    };
}

const BACKGROUND_LOCATION_TRACKING_TASK_NAME = 'background-location-tracking';

export {getBackgroundLocationTaskOptions, BACKGROUND_LOCATION_TRACKING_TASK_NAME};
