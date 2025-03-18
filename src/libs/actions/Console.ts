import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log} from '@src/types/onyx';

let isNewAppLaunch = true;
/**
 * Merge the new log into the existing logs in Onyx
 * @param log the log to add
 */
function addLog(log: Log) {
    Onyx.merge(ONYXKEYS.LOGS, {
        [log.time.getTime()]: log,
    });
}

/**
 * Set whether or not to store logs in Onyx
 * @param store whether or not to store logs
 */
function setShouldStoreLogs(store: boolean) {
    Onyx.set(ONYXKEYS.SHOULD_STORE_LOGS, store);
}

/**
 * Disable logging and flush the logs from Onyx
 */
function disableLoggingAndFlushLogs() {
    setShouldStoreLogs(false);
    Onyx.set(ONYXKEYS.LOGS, null);
}

/**
 * Clears the persisted logs on app launch,
 * so that we have fresh logs for the new app session.
 */
function flushAllLogsOnAppLaunch() {
    if (!isNewAppLaunch) {
        return Promise.resolve();
    }

    isNewAppLaunch = false;
    return Onyx.set(ONYXKEYS.LOGS, {});
}

export {addLog, setShouldStoreLogs, disableLoggingAndFlushLogs, flushAllLogsOnAppLaunch};
