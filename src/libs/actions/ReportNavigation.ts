import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

function saveLastSearchParams(value: LastSearchParams) {
    Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, value);
}

function clearLastSearchParams() {
    Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {});
}

/**
 * Persists the pre-sorted report IDs computed by Search/index.tsx so that
 * MoneyRequestReportNavigation can read them without re-running getSections.
 * Stored in a separate key so that saveLastSearchParams (Onyx.set) cannot wipe it.
 */
function saveSortedReportIDs(sortedReportIDs: Array<string | undefined>) {
    Onyx.set(ONYXKEYS.REPORT_NAVIGATION_SORTED_REPORT_IDS, sortedReportIDs);
}

export {clearLastSearchParams, saveLastSearchParams, saveSortedReportIDs};
