// import * as BackgroundFetch from 'expo-background-fetch';
// import {defineTask} from 'expo-task-manager';
import TaskManager from '@expensify/react-native-background-task';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

const BACKGROUND_FETCH_TASK = 'FLUSH-SEQUENTIAL-QUEUE-BACKGROUND-FETCH';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, () => {
    SequentialQueue.flush();
});

function registerBackgroundFetch() {
    console.log('probably not needed');
    // return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    //     minimumInterval: 60 * 15, // 15 minutes
    //     stopOnTerminate: false,
    //     startOnBoot: true,
    // });
}

export default registerBackgroundFetch;
