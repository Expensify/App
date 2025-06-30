import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Set whether or not to record troubleshoot data
 * @param shouldRecord Whether or not to record troubleshoot data
 */
function setShouldRecordTroubleshootData(shouldRecord: boolean) {
    Onyx.set(ONYXKEYS.SHOULD_RECORD_TROUBLESHOOT_DATA, shouldRecord);
}

// eslint-disable-next-line import/prefer-default-export
export {setShouldRecordTroubleshootData};
