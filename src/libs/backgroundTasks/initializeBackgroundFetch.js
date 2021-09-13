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

        // TODO: retrieve network data, persist to Onyx
        const x = 1 + 1;
        console.log('[BackgroundFetch] x', x);

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
