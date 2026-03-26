import type {OnyxCollection} from 'react-native-onyx';
import {isArchivedReport} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Selector that extracts archived report IDs as a sorted array.
 * Onyx performs shallow comparison on the returned array to prevent
 * unnecessary re-renders without expensive deep comparison of Sets.
 */
const archivedReportIdsSelector = (reportNameValuePairs: OnyxCollection<ReportNameValuePairs>): string[] => {
    if (!reportNameValuePairs) {
        return [];
    }
    const ids: string[] = [];
    for (const [key, value] of Object.entries(reportNameValuePairs)) {
        if (isArchivedReport(value)) {
            ids.push(key);
        }
    }
    return ids;
};

/**
 * Hook that returns a Set of archived report IDs
 */
function useArchivedReportsIdSet(): ArchivedReportsIDSet {
    const [archivedReportIds = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {selector: archivedReportIdsSelector});

    return new Set(archivedReportIds);
}

export default useArchivedReportsIdSet;
