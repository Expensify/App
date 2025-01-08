import TaskManager from '@expensify/react-native-background-task';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

const BACKGROUND_FETCH_TASK = 'FLUSH-SEQUENTIAL-QUEUE-BACKGROUND-FETCH';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, () => {
    Log.info('BackgroundTask', true, `Executing ${BACKGROUND_FETCH_TASK} background task at ${new Date().toISOString()}`);
    SequentialQueue.flush();
});
