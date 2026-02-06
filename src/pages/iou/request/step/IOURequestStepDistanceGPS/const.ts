import {Accuracy} from 'expo-location';
import type {LocationTaskOptions} from 'expo-location';

const GPS_DISTANCE_INTERVAL_METERS = 100;

function getBackgroundLocationTaskOptions(notificationTitle: string, notificationBody: string): LocationTaskOptions {
    return {
        accuracy: Accuracy.Highest,
        distanceInterval: GPS_DISTANCE_INTERVAL_METERS,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
            notificationTitle,
            notificationBody,
            killServiceOnDestroy: true,
        },
    };
}

const BACKGROUND_LOCATION_TRACKING_TASK_NAME = 'background-location-tracking';

export {getBackgroundLocationTaskOptions, BACKGROUND_LOCATION_TRACKING_TASK_NAME, GPS_DISTANCE_INTERVAL_METERS};
