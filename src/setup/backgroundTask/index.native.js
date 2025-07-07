"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_background_task_1 = require("@expensify/react-native-background-task");
var Log_1 = require("@libs/Log");
var SequentialQueue_1 = require("@libs/Network/SequentialQueue");
var BACKGROUND_FETCH_TASK = 'FLUSH-SEQUENTIAL-QUEUE-BACKGROUND-FETCH';
react_native_background_task_1.default.defineTask(BACKGROUND_FETCH_TASK, function () {
    Log_1.default.info('BackgroundTask', true, "Executing ".concat(BACKGROUND_FETCH_TASK, " background task at ").concat(new Date().toISOString()));
    (0, SequentialQueue_1.flush)();
});
