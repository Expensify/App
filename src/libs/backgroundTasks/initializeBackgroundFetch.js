import BackgroundFetch from 'react-native-background-fetch';

/**
 * Initialize task to run background fetch
 */
export default async function initializeBackgroundFetch() { // eslint-disable-line
    // Setup task config
    const config = {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        // Android options
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Default
        requiresCharging: false, // Default
        requiresDeviceIdle: false, // Default
        requiresBatteryNotLow: false, // Default
        requiresStorageNotLow: false, // Default
        enableHeadless: true,
    };

    // Setup BackgroundFetch task
    const onEvent = async (taskId) => { // eslint-disable-line
        console.log('[BackgroundFetch] task: ', taskId);
        console.log('Fetching Data via BG');

        // TODO: retrieve network data, persist to Onyx
        const response = await fetch('http://5361-103-93-193-198.ngrok.io/');
        console.log('Hitting API ', response);

        const responseJson = await response.json();
        console.log('Fetching Data via BG');
        console.log('[BackgroundFetch] response', responseJson);

        // Signal to OS that task is complete.
        BackgroundFetch.finish(taskId);
    };

    // Invoked when task exceeds its allowed running-time
    const onTimeout = async (taskId) => { // eslint-disable-line
        console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
        BackgroundFetch.finish(taskId);
    };

    // Initialize BackgroundFetch only once when component mounts.
    const status = await BackgroundFetch.configure(config, onEvent, onTimeout);
    console.log('[BackgroundFetch] configure status: ', status);
}
