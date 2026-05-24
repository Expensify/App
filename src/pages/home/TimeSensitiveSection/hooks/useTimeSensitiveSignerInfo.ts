import useOnyx from '@hooks/useOnyx';
import {getOriginalMessage, isReimbursementDirectionInformationRequiredAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type PendingSignerInfo = {
    /** The policy ID that owns the bank account requiring signer info */
    policyID: string;

    /** The bank account ID requiring signer info */
    bankAccountID: string;

    /** Last four digits of the bank account number */
    bankAccountLastFour: string;
};

function useTimeSensitiveSignerInfo() {
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    const pendingSignerInfo: PendingSignerInfo[] = [];
    const seenKeys = new Set<string>();

    for (const reportActions of Object.values(allReportActions ?? {})) {
        for (const action of Object.values(reportActions ?? {})) {
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
export type {PendingSignerInfo};
