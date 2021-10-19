/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';

import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';


const headlessTask = async (event) => { // eslint-disable-line

    // Get task id from event {}:
    const taskId = event.taskId;
    const isTimeout = event.timeout; // <-- true when your background-time has expired.
    if (isTimeout) {
        // This task has exceeded its allowed running-time.
        // You must stop what you're doing immediately finish(taskId)
        console.log('[BackgroundFetchHeadlessTask] Headless TIMEOUT:', taskId);
        BackgroundFetch.finish(taskId);
        return;
    }

    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

    // Perform an example HTTP request.
    // Important:  await asychronous tasks when using HeadlessJS.
    const response = await fetch('http://5361-103-93-193-198.ngrok.io/');
    const responseJson = await response.json();
    console.log('[BackgroundFetchHeadlessTask] response: ', responseJson);

    // Required:  Signal to native code that your task is complete.
    // If you don't do this, your app could be terminated and/or assigned
    // battery-blame for consuming too much time in background.
    BackgroundFetch.finish(taskId);
};

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(headlessTask);

AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();
