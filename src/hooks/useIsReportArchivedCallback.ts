import {useCallback} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import useArchivedReportsIdSet from './useArchivedReportsIdSet';

function useIsReportArchivedCallback() {
    const archivedReportsIdSet = useArchivedReportsIdSet();
    return useCallback((reportID?: string) => !!reportID && archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`), [archivedReportsIdSet]);
}

export default useIsReportArchivedCallback;
