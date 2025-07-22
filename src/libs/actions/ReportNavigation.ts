import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

function setActiveReportsIDs(ids: string[]) {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, ids);
}

function saveLastSearchParams(value: LastSearchParams) {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, value);
}

export {setActiveReportsIDs, saveLastSearchParams};
