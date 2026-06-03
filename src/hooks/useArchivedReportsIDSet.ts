import {buildArchivedReportsIDSet} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

/**
 * Hook that returns a Set of archived report IDs once report name-value pairs are loaded
 */
function useArchivedReportsIDSet(): ArchivedReportsIDSet | undefined {
    const [reportNameValuePairs, reportNameValuePairsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    if (isLoadingOnyxValue(reportNameValuePairsResult)) {
        return undefined;
    }

    return buildArchivedReportsIDSet(reportNameValuePairs);
}

export default useArchivedReportsIDSet;
