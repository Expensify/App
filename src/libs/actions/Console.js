
exports.__esModule = true;
exports.flushAllLogsOnAppLaunch = exports.disableLoggingAndFlushLogs = exports.setShouldStoreLogs = exports.addLog = void 0;
const react_native_onyx_1 = require('react-native-onyx');
const ONYXKEYS_1 = require('@src/ONYXKEYS');

let isNewAppLaunch = true;
/**
 * Merge the new log into the existing logs in Onyx
 * @param log the log to add
 */
function addLog(log) {
    let _a;
    react_native_onyx_1['default'].merge(ONYXKEYS_1['default'].LOGS, ((_a = {}), (_a[log.time.getTime()] = log), _a));
}
exports.addLog = addLog;
/**
 * Set whether or not to store logs in Onyx
 * @param store whether or not to store logs
 */
function setShouldStoreLogs(store) {
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].SHOULD_STORE_LOGS, store);
}
exports.setShouldStoreLogs = setShouldStoreLogs;
/**
 * Disable logging and flush the logs from Onyx
 */
function disableLoggingAndFlushLogs() {
    setShouldStoreLogs(false);
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].LOGS, null);
}
exports.disableLoggingAndFlushLogs = disableLoggingAndFlushLogs;
/**
 * Clears the persisted logs on app launch,
 * so that we have fresh logs for the new app session.
 */
function flushAllLogsOnAppLaunch() {
    if (!isNewAppLaunch) {
        return Promise.resolve();
    }
    isNewAppLaunch = false;
    return react_native_onyx_1['default'].set(ONYXKEYS_1['default'].LOGS, {});
}
exports.flushAllLogsOnAppLaunch = flushAllLogsOnAppLaunch;
