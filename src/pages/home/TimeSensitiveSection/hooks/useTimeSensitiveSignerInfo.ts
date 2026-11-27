import useOnyx from '@hooks/useOnyx';

import {getOriginalMessage, isReimbursementDirectionInformationRequiredAction} from '@libs/ReportActionsUtils';
import {isPolicyExpenseChat} from '@libs/ReportUtils';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {accountIDSelector} from '@selectors/Session';

type PendingSignerInfo = {
    /** The policy ID that owns the bank account requiring signer info */
    policyID: string;

    /** The bank account ID requiring signer info */
    bankAccountID: string;

    /** Last four digits of the bank account number */
    bankAccountLastFour: string;
};

const EMPTY_PENDING_SIGNER_INFO: PendingSignerInfo[] = [];

function useTimeSensitiveSignerInfo() {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // policyID -> current user's policy expense chat reportID.
    // The reimbursement-director-information-required action is posted in the signer's
    // policy expense chat, so we only need to look at that chat's actions per policy.
    const [expenseChatByPolicyID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports: OnyxCollection<Report>) => {
            const chatByPolicyID: Record<string, string> = {};
            for (const report of Object.values(reports ?? {})) {
                if (!report?.reportID || !report.policyID || report.ownerAccountID !== accountID || !isPolicyExpenseChat(report)) {
                    continue;
                }
                chatByPolicyID[report.policyID] = report.reportID;
            }
            return chatByPolicyID;
        },
    });
    // The scan runs in the selector, so other report action writes don't re-render Home.
    const [pendingSignerInfo = EMPTY_PENDING_SIGNER_INFO] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: (allReportActions: OnyxCollection<ReportActions>) => {
            const signerInfo: PendingSignerInfo[] = [];
            const seenKeys = new Set<string>();

            for (const policy of Object.values(allPolicies ?? {})) {
                if (!policy?.achAccount?.bankAccountID) {
                    continue;
                }
                const expenseChatReportID = expenseChatByPolicyID?.[policy.id];
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
                    signerInfo.push({
                        policyID: message.policyID,
                        bankAccountID: message.bankAccountID,
                        bankAccountLastFour: message.bankAccountLastFour,
                    });
                }
            }
            return signerInfo;
        },
    });

    return {
        shouldShowEnterSignerInfo: pendingSignerInfo.length > 0,
        pendingSignerInfo,
    };
}

export default useTimeSensitiveSignerInfo;
