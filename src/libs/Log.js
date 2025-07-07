"use strict";
// Making an exception to this rule here since we don't need an "action" for Log and Log should just be used directly. Creating a Log
// action would likely cause confusion about which one to use. But most other API methods should happen inside an action file.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable rulesdir/no-api-in-views */
var expensify_common_1 = require("expensify-common");
var react_native_app_logs_1 = require("react-native-app-logs");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var package_json_1 = require("../../package.json");
var Console_1 = require("./actions/Console");
var Console_2 = require("./Console");
var getPlatform_1 = require("./getPlatform");
var Network_1 = require("./Network");
var requireParameters_1 = require("./requireParameters");
var timeout;
var shouldCollectLogs = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SHOULD_STORE_LOGS,
    callback: function (val) {
        if (!val) {
            shouldCollectLogs = false;
        }
        shouldCollectLogs = !!val;
    },
});
function LogCommand(parameters) {
    var commandName = 'Log';
    (0, requireParameters_1.default)(['logPacket', 'expensifyCashAppVersion'], parameters, commandName);
    // Note: We are forcing Log to run since it requires no authToken and should only be queued when we are offline.
    // Non-cancellable request: during logout, when requests are cancelled, we don't want to cancel any remaining logs
    return (0, Network_1.post)(commandName, __assign(__assign({}, parameters), { forceNetworkRequest: true, canCancel: false }));
}
/**
 * Network interface for logger.
 */
function serverLoggingCallback(logger, params) {
    var requestParams = params;
    requestParams.shouldProcessImmediately = false;
    requestParams.shouldRetry = false;
    requestParams.expensifyCashAppVersion = "expensifyCash[".concat((0, getPlatform_1.default)(), "]").concat(package_json_1.default.version);
    if (requestParams.parameters) {
        requestParams.parameters = JSON.stringify(requestParams.parameters);
    }
    clearTimeout(timeout);
    timeout = setTimeout(function () { return logger.info('Flushing logs older than 10 minutes', true, {}, true); }, 10 * 60 * 1000);
    return LogCommand(requestParams);
}
// Note: We are importing Logger from expensify-common because it is used by other platforms. The server and client logging
// callback methods are passed in here so we can decouple the logging library from the logging methods.
var Log = new expensify_common_1.Logger({
    serverLoggingCallback: serverLoggingCallback,
    clientLoggingCallback: function (message, extraData) {
        if (!(0, Console_2.shouldAttachLog)(message)) {
            return;
        }
        (0, Console_1.flushAllLogsOnAppLaunch)().then(function () {
            console.debug(message, extraData);
            if (shouldCollectLogs) {
                (0, Console_1.addLog)({ time: new Date(), level: CONST_1.default.DEBUG_CONSOLE.LEVELS.DEBUG, message: message, extraData: extraData });
            }
        });
    },
    maxLogLinesBeforeFlush: 150,
    isDebug: true,
});
timeout = setTimeout(function () { return Log.info('Flushing logs older than 10 minutes', true, {}, true); }, 10 * 60 * 1000);
react_native_app_logs_1.default.configure({ appGroupName: 'group.com.expensify.new', interval: -1 });
react_native_app_logs_1.default.registerHandler({
    filter: '[NotificationService]',
    handler: function (_a) {
        var filter = _a.filter, logs = _a.logs;
        logs.forEach(function (log) {
            // Both native and JS logs are captured by the filter so we replace the filter before logging to avoid an infinite loop
            var message = "[PushNotification] ".concat(log.message.replace(filter, 'NotificationService -'));
            if (log.level === 'error') {
                Log.hmmm(message);
            }
            else {
                Log.info(message);
            }
        });
    },
});
exports.default = Log;
