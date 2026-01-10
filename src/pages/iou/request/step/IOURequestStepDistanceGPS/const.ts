import {Accuracy} from 'expo-location';
import type {LocationTaskOptions} from 'expo-location';

const BACKGROUND_LOCATION_TASK_OPTIONS: LocationTaskOptions = {
    accuracy: Accuracy.Highest,
    distanceInterval: 100,
    showsBackgroundLocationIndicator: true,
};

const BACKGROUND_LOCATION_TRACKING_TASK_NAME = 'background-location-tracking';

export {BACKGROUND_LOCATION_TASK_OPTIONS, BACKGROUND_LOCATION_TRACKING_TASK_NAME};
