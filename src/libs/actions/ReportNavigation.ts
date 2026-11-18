import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import Onyx from 'react-native-onyx';

function saveLastSearchParams(value: LastSearchParams) {
    Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, value);
}

function clearLastSearchParams() {
    Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {});
}

export {clearLastSearchParams, saveLastSearchParams};
