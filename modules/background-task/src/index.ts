import NativeReactNativeBackgroundTask from './NativeReactNativeBackgroundTask';

type TaskManagerTaskExecutor<T = unknown> = (data: T) => void | Promise<void>;

const taskExecutors = new Map<string, TaskManagerTaskExecutor>();

NativeReactNativeBackgroundTask.onBackgroundTaskExecution((taskName) => {
    const executor = taskExecutors.get(taskName);

    if (executor) {
        executor(taskName);
    }
});

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

export default TaskManager;
