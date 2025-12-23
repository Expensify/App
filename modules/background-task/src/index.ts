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
    subscription = eventEmitter.addListener('onBackgroundTaskExecution', onBackgroundTaskExecution);
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
    /**
     * Starts a background receipt upload on Android.
     */
    startReceiptUpload: (options: Record<string, unknown>): Promise<void> => NativeReactNativeBackgroundTask.startReceiptUpload(options),
};

addBackgroundTaskListener();

export default TaskManager;
