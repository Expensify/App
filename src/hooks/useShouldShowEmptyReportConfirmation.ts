import {accountIDSelector} from '@selectors/Session';
import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {hasEmptyReportsForPolicy} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

function reportIDsWithActiveTransactionsSelector(transactions: OnyxCollection<Transaction>): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    if (!transactions) {
        return result;
    }
    for (const transaction of Object.values(transactions)) {
        if (transaction?.reportID && transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            result[transaction.reportID] = true;
        }
    }
    return result;
}

function useShouldShowEmptyReportConfirmation(policyID: string | undefined, skip?: boolean): boolean {
    const [hasDismissedConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [reportIDsWithActiveTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: reportIDsWithActiveTransactionsSelector});

    const hasEmptyReportSelector = useCallback(
        (reports: Parameters<typeof hasEmptyReportsForPolicy>[0]) => {
            if (skip || hasDismissedConfirmation) {
                return false;
            }
            return hasEmptyReportsForPolicy(reports, policyID, reportIDsWithActiveTransactions ?? {}, accountID);
        },
        [policyID, accountID, hasDismissedConfirmation, skip, reportIDsWithActiveTransactions],
    );
    const [hasEmptyReport = false] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            selector: hasEmptyReportSelector,
        },
        [policyID, accountID, hasDismissedConfirmation, skip, reportIDsWithActiveTransactions],
    );

    return hasEmptyReport;
}

export default useShouldShowEmptyReportConfirmation;
