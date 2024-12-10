// FIXME: .android.ts doesn't seem to work, .native.ts neither.
import TaskManager from '@expensify/react-native-background-task';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

const BACKGROUND_FETCH_TASK = 'FLUSH-SEQUENTIAL-QUEUE-BACKGROUND-FETCH';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, () => {
    SequentialQueue.flush();
});
