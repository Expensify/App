import * as BackgroundFetch from 'expo-background-fetch';
import {defineTask} from 'expo-task-manager';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

const BACKGROUND_FETCH_TASK = 'FLUSH-SEQUENTIAL-QUEUE-BACKGROUND-FETCH';

defineTask(BACKGROUND_FETCH_TASK, () => {
    SequentialQueue.flush();
});

function registerBackgroundFetch() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
    });
}

export default registerBackgroundFetch;
