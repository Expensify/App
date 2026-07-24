/**
 * Identifies queued payments that require the current user to add a personal bank account.
 */
import useOnyx from '@hooks/useOnyx';

import hasCreditBankAccount from '@libs/actions/ReimbursementAccount/hasCreditBankAccount';
import {isNewerReportAction, isReimbursementQueuedAction} from '@libs/ReportActionsUtils';
import {getMissingPaymentMethodForQueuedPayment} from '@libs/ReportUtils';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection} from 'react-native-onyx';

import {accountIDSelector} from '@selectors/Session';
import {tierNameSelector} from '@selectors/UserWallet';

type ReimbursementQueuedAction = ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED>;

function getLatestReimbursementQueuedAction(reportID: string, allReportActions: OnyxCollection<ReportActions>): ReimbursementQueuedAction | undefined {
    let latestAction: ReimbursementQueuedAction | undefined;
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];

    for (const action of Object.values(reportActions ?? {})) {
        if (isReimbursementQueuedAction(action) && (!latestAction || isNewerReportAction(action, latestAction))) {
            latestAction = action;
        }
    }

    return latestAction;
}

function useTimeSensitiveAddBankAccount() {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const waitingReportIDsSelector = (allReports: OnyxCollection<Report>): string[] =>
        Object.values(allReports ?? {})
            .filter((report): report is Report => !!report?.reportID && report.isWaitingOnBankAccount === true && report.ownerAccountID === accountID)
            .map((report) => report.reportID);
    const [waitingReportIDs] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: waitingReportIDsSelector});
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector});
    const canShowAddBankAccount = accountID !== undefined && !isLoadingOnyxValue(bankAccountListMetadata) && !hasCreditBankAccount(bankAccountList);

    const shouldShowAddBankAccountSelector = (allReportActions: OnyxCollection<ReportActions>): boolean => {
        if (!canShowAddBankAccount) {
            return false;
        }

        return (waitingReportIDs ?? []).some((reportID) => {
            const queuedAction = getLatestReimbursementQueuedAction(reportID, allReportActions);
            return !!queuedAction && getMissingPaymentMethodForQueuedPayment(userWalletTierName, queuedAction, bankAccountList) === 'bankAccount';
        });
    };
    const [shouldShowAddBankAccount = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: shouldShowAddBankAccountSelector});

    return {shouldShowAddBankAccount};
}

export default useTimeSensitiveAddBankAccount;
