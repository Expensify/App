import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setActiveReportIDs(ids: string[]) {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, ids);
}

function setActiveReportID(ids: string[]) {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, ids);
}

function clearActiveReportIDs() {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, null);
}

export {setActiveReportIDs, clearActiveReportIDs, setActiveReportID};
