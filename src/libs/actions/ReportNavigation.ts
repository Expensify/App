import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

function setActiveReportIDs(ids: string[], shouldMerge = false) {
    if (shouldMerge) {
        return Onyx.merge(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, ids);
    }
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, ids);
}

function setActiveReportID(ids: string[]) {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, ids);
}

function clearActiveReportIDs() {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, null);
}

function saveLastSearchParams(value: LastSearchParams) {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, value);
}

export {setActiveReportIDs, clearActiveReportIDs, setActiveReportID, saveLastSearchParams};
