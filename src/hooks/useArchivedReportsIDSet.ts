import {buildArchivedReportsIDSet} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook that returns a Set of archived report IDs
 */
function useArchivedReportsIDSet(): ArchivedReportsIDSet {
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    return buildArchivedReportsIDSet(reportNameValuePairs);
}

export default useArchivedReportsIDSet;
