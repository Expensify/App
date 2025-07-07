"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var NativeReactNativeBackgroundTask_1 = require("./NativeReactNativeBackgroundTask");
var eventEmitter = new react_native_1.NativeEventEmitter(NativeReactNativeBackgroundTask_1.default);
var taskExecutors = new Map();
var subscription;
function onBackgroundTaskExecution(_a) {
    var taskName = _a.taskName;
    var executor = taskExecutors.get(taskName);
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
var TaskManager = {
    /**
     * Defines a task that can be executed in the background.
     * @param taskName - Name of the task. Must be unique and match the name used when registering the task.
     * @param taskExecutor - Function that will be executed when the task runs.
     */
    defineTask: function (taskName, taskExecutor) {
        if (typeof taskName !== 'string' || taskName.length === 0) {
            throw new Error('Task name must be a string');
        }
        if (typeof taskExecutor !== 'function') {
            throw new Error('Task executor must be a function');
        }
        taskExecutors.set(taskName, taskExecutor);
        return NativeReactNativeBackgroundTask_1.default.defineTask(taskName, taskExecutor);
    },
};
addBackgroundTaskListener();
exports.default = TaskManager;
