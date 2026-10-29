import useOnyx from '@hooks/useOnyx';

import {getOriginalMessage, isReimbursementDirectionInformationRequiredAction} from '@libs/ReportActionsUtils';
import {isPolicyExpenseChat} from '@libs/ReportUtils';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {accountIDSelector} from '@selectors/Session';

type PendingSignerInfo = {
    /** The policy ID that owns the bank account requiring signer info */
    policyID: string;

    /** The bank account ID requiring signer info */
    bankAccountID: string;

    /** Last four digits of the bank account number */
    bankAccountLastFour: string;
};

function useTimeSensitiveSignerInfo() {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    const pendingSignerInfo: PendingSignerInfo[] = [];
    const seenKeys = new Set<string>();

    // Build policyID -> current user's policy expense chat reportID map in one pass.
    // The reimbursement-director-information-required action is posted in the signer's
    // policy expense chat, so we only need to look at that chat's actions per policy.
    const expenseChatByPolicyID = new Map<string, string>();
    for (const report of Object.values(allReports ?? {})) {
        if (!report?.reportID || !report.policyID || report.ownerAccountID !== accountID || !isPolicyExpenseChat(report)) {
            continue;
        }
        expenseChatByPolicyID.set(report.policyID, report.reportID);
    }

    for (const policy of Object.values(allPolicies ?? {})) {
        if (!policy?.achAccount?.bankAccountID) {
            continue;
        }
        const expenseChatReportID = expenseChatByPolicyID.get(policy.id);
        if (!expenseChatReportID) {
            continue;
        }
        const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`];
        if (!reportActions) {
            continue;
        }
        for (const action of Object.values(reportActions)) {
            if (!isReimbursementDirectionInformationRequiredAction(action)) {
                continue;
            }
            const message = getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED>(action);
            if (!message || message.completed || !message.policyID || !message.bankAccountID) {
                continue;
            }
            const key = `${message.policyID}-${message.bankAccountID}`;
            if (seenKeys.has(key)) {
                continue;
            }
            seenKeys.add(key);
            pendingSignerInfo.push({
                policyID: message.policyID,
                bankAccountID: message.bankAccountID,
                bankAccountLastFour: message.bankAccountLastFour,
            });
        }
    }

    return {
        shouldShowEnterSignerInfo: pendingSignerInfo.length > 0,
        pendingSignerInfo,
    };
}

export default useTimeSensitiveSignerInfo;
