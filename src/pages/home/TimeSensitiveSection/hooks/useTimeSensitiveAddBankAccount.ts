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

type WaitingReportPaymentData = {
    reportID: string;
    chatReportID?: string;
    chatIOUReportID?: string;
};

function getLatestReimbursementQueuedAction(
    reportID: string,
    chatReportID: string | undefined,
    chatIOUReportID: string | undefined,
    allReportActions: OnyxCollection<ReportActions>,
): ReimbursementQueuedAction | undefined {
    let latestAction: ReimbursementQueuedAction | undefined;
    const seenActionIDs = new Set<string>();
    const actionCollections = [
        {actions: allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`], isChatActionCollection: false},
        {actions: chatReportID ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`] : undefined, isChatActionCollection: true},
    ];

    for (const {actions, isChatActionCollection} of actionCollections) {
        for (const action of Object.values(actions ?? {})) {
            if (!isReimbursementQueuedAction(action)) {
                continue;
            }
            const isCorrelatedByChildReportID = action.childReportID === reportID;
            const isCorrelatedByCollection = !action.childReportID && (!isChatActionCollection || chatIOUReportID === reportID);
            if (!isCorrelatedByChildReportID && !isCorrelatedByCollection) {
                continue;
            }
            if (seenActionIDs.has(action.reportActionID)) {
                continue;
            }
            seenActionIDs.add(action.reportActionID);
            if (!latestAction || isNewerReportAction(action, latestAction)) {
                latestAction = action;
            }
        }
    }

    return latestAction;
}

function useTimeSensitiveAddBankAccount() {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const waitingReportsSelector = (allReports: OnyxCollection<Report>): WaitingReportPaymentData[] =>
        Object.values(allReports ?? {})
            .filter((report): report is Report => !!report?.reportID && report.isWaitingOnBankAccount === true && report.ownerAccountID === accountID)
            .map((report) => ({
                reportID: report.reportID,
                chatReportID: report.chatReportID,
                chatIOUReportID: report.chatReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`]?.iouReportID : undefined,
            }));
    const [waitingReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: waitingReportsSelector});
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector});
    const canShowAddBankAccount = accountID !== undefined && !isLoadingOnyxValue(bankAccountListMetadata) && !hasCreditBankAccount(bankAccountList);

    const shouldShowAddBankAccountSelector = (allReportActions: OnyxCollection<ReportActions>): boolean => {
        if (!canShowAddBankAccount) {
            return false;
        }

        return (waitingReports ?? []).some((report) => {
            const queuedAction = getLatestReimbursementQueuedAction(report.reportID, report.chatReportID, report.chatIOUReportID, allReportActions);
            return !!queuedAction && getMissingPaymentMethodForQueuedPayment(userWalletTierName, queuedAction, bankAccountList) === 'bankAccount';
        });
    };
    const [shouldShowAddBankAccount = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: shouldShowAddBankAccountSelector});

    return {shouldShowAddBankAccount};
}

export default useTimeSensitiveAddBankAccount;
