import {accountIDSelector} from '@selectors/Session';
import {useCallback} from 'react';
import {hasEmptyReportsForPolicy} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useHasEmptyReportsForPolicy(policyID: string | undefined): boolean {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const hasEmptyReportSelector = useCallback((reports: Parameters<typeof hasEmptyReportsForPolicy>[0]) => hasEmptyReportsForPolicy(reports, policyID, accountID), [policyID, accountID]);
    const [hasEmptyReport = false] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            selector: hasEmptyReportSelector,
        },
        [policyID, accountID],
    );

    return hasEmptyReport;
}

export default useHasEmptyReportsForPolicy;
