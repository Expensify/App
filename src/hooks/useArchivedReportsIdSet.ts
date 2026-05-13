import {isArchivedReport} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook that returns a Set of archived report IDs
 */
function useArchivedReportsIdSet(): ArchivedReportsIDSet {
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const ids: string[] = [];

    if (reportNameValuePairs) {
        for (const [key, value] of Object.entries(reportNameValuePairs)) {
            if (isArchivedReport(value)) {
                ids.push(key);
            }
        }
    }
    return new Set(ids);
}

export default useArchivedReportsIdSet;
