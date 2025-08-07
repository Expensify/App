import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

function saveLastSearchParams(value: LastSearchParams) {
    Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, value);
}

export default saveLastSearchParams;
