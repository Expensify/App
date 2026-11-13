import type {EmitterSubscription} from 'react-native';

import {NativeEventEmitter} from 'react-native';

import NativeReactNativeBackgroundTask from './NativeReactNativeBackgroundTask';

type TaskManagerTaskExecutor<T = unknown> = (data: T) => void | Promise<void>;

const eventEmitter = new NativeEventEmitter(NativeReactNativeBackgroundTask);
const taskExecutors = new Map<string, TaskManagerTaskExecutor>();
let subscription: EmitterSubscription | undefined;

function onBackgroundTaskExecution({taskName}: {taskName: string}) {
    const executor = taskExecutors.get(taskName);

    if (executor) {
        executor(taskName);
    }
}

function addBackgroundTaskListener() {
    if (subscription) {
        subscription.remove();
    }
    // The native module sends `{taskName}`, but `NativeEventEmitter` can't say so on both React Native versions we support: it
    // takes no event map on 0.86 and types every listener argument as `Object` under the Strict TypeScript API.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    subscription = eventEmitter.addListener('onBackgroundTaskExecution', onBackgroundTaskExecution as (event: unknown) => void);
}

const TaskManager = {
    /**
     * Defines a task that can be executed in the background.
     * @param taskName - Name of the task. Must be unique and match the name used when registering the task.
     * @param taskExecutor - Function that will be executed when the task runs.
     */
    defineTask: (taskName: string, taskExecutor: TaskManagerTaskExecutor): Promise<void> => {
        if (typeof taskName !== 'string' || taskName.length === 0) {
            throw new Error('Task name must be a string');
        }
        if (typeof taskExecutor !== 'function') {
            throw new Error('Task executor must be a function');
        }

        taskExecutors.set(taskName, taskExecutor);

        return NativeReactNativeBackgroundTask.defineTask(taskName, taskExecutor);
    },
};

addBackgroundTaskListener();

export default TaskManager;
