import type {LocationTaskOptions} from 'expo-location';

import {Accuracy, ActivityType} from 'expo-location';

const GPS_DISTANCE_INTERVAL_METERS = 50;

const BACKGROUND_LOCATION_TASK_OPTIONS: LocationTaskOptions = {
    accuracy: Accuracy.Highest,
    distanceInterval: GPS_DISTANCE_INTERVAL_METERS,
    activityType: ActivityType.AutomotiveNavigation,
};

const BACKGROUND_LOCATION_TRACKING_TASK_NAME = 'background-location-tracking';

export {BACKGROUND_LOCATION_TASK_OPTIONS, BACKGROUND_LOCATION_TRACKING_TASK_NAME, GPS_DISTANCE_INTERVAL_METERS};
