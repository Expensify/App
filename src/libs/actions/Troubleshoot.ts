import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// Auto-off timeout for troubleshoot recording (10 minutes)
const AUTO_OFF_TIMEOUT_MS = 10 * 60 * 1000;

// Module-level timeout reference to persist across component mounts/unmounts
let autoOffTimeout: NodeJS.Timeout | null = null;

/**
 * Clear the auto-off timeout if it exists
 */
function clearAutoOffTimeout() {
    if (!autoOffTimeout) {
        return;
    }

    clearTimeout(autoOffTimeout);
    autoOffTimeout = null;
}

/**
 * Set whether or not to record troubleshoot data
 * @param shouldRecord Whether or not to record troubleshoot data
 */
function setShouldRecordTroubleshootData(shouldRecord: boolean) {
    clearAutoOffTimeout();

    if (shouldRecord) {
        autoOffTimeout = setTimeout(() => {
            Onyx.set(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, false);
            autoOffTimeout = null;
        }, AUTO_OFF_TIMEOUT_MS);
    }

    Onyx.set(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, shouldRecord);
}

// eslint-disable-next-line import/prefer-default-export
export {setShouldRecordTroubleshootData};
