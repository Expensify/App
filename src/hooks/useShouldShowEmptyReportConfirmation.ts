import {accountIDSelector} from '@selectors/Session';
import {useCallback} from 'react';
import {hasEmptyReportsForPolicy} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useShouldShowEmptyReportConfirmation(policyID: string | undefined, skip?: boolean): boolean {
    const [hasDismissedConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const hasEmptyReportSelector = useCallback(
        (reports: Parameters<typeof hasEmptyReportsForPolicy>[0]) => {
            if (skip || hasDismissedConfirmation) {
                return false;
            }
            return hasEmptyReportsForPolicy(reports, policyID, accountID);
        },
        [policyID, accountID, hasDismissedConfirmation, skip],
    );
    const [hasEmptyReport = false] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            selector: hasEmptyReportSelector,
        },
        [policyID, accountID, hasDismissedConfirmation, skip],
    );

    return hasEmptyReport;
}

export default useShouldShowEmptyReportConfirmation;
