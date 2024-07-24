import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log} from '@src/types/onyx';

let isNewAppLaunch = true;
/**
 * Merge the new log into the existing logs in Onyx
 * @param log the log to add
 */
function addLog(log: Log) {
    /**
     * If this is the new app launch, we want to reset the log state in Onyx.
     * This is because we don't want to keep logs from previous sessions and
     * blow up the Onyx state.
     */
    if (isNewAppLaunch) {
        isNewAppLaunch = false;
        Onyx.set(ONYXKEYS.LOGS, {
            [log.time.getTime()]: log,
        });
    } else {
        Onyx.merge(ONYXKEYS.LOGS, {
            [log.time.getTime()]: log,
        });
    }
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

export {addLog, setShouldStoreLogs, disableLoggingAndFlushLogs};
