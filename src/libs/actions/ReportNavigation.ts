import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

function setActiveReportsIDs(ids: string[], shouldMerge = false) {
    const objectFromArray = ids.reduce(
        (acc, key) => {
            acc[key] = '';
            return acc;
        },
        {} as Record<string, string>,
    );

    if (shouldMerge) {
        return Onyx.merge(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, objectFromArray);
    }
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_REPORT_IDS, objectFromArray);
}

function saveLastSearchParams(value: LastSearchParams) {
    return Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, value);
}

export {setActiveReportsIDs, saveLastSearchParams};
