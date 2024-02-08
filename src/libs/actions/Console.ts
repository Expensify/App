import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log} from '@src/types/onyx';

/**
 * Merge the new log into the existing logs in Onyx
 * @param log the log to add
 */
function addLog(log: Log) {
    Onyx.merge(ONYXKEYS.LOGS, {
        [log.time.getTime()]: log,
    });
}

function setShouldStoreLogs(store: boolean) {
    Onyx.set(ONYXKEYS.SHOULD_STORE_LOGS, store);
}

export {addLog, setShouldStoreLogs};
