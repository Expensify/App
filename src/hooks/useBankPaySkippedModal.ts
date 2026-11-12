/**
 * Shows the alert explaining why reports that are non-reimbursable or total $0 or less weren't paid through the bank account,
 * for a single report, for some reports of a bulk payment, or for a bulk payment where none could be paid.
 */
import {getAccessiblePolicyBankAccount} from '@libs/PolicyPaymentUtils';
import {isBankPayBlockedBySpend} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {BankAccountList, Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

type BankPaySkippedReport = {
    reportID: string;
    reportName: string;
};

type UseBankPaySkippedModalParams = {
    /** The user's bank accounts, so the title can name the one paying */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** The report a single Pay button pays. Left out for a bulk payment */
    report?: OnyxEntry<Report>;

    /** The workspace whose bank account the title names when none was picked */
    policy?: OnyxEntry<Policy>;

    /** Whether the report can only be marked as paid, before its bank account option is kept to explain why it can't pay */
    onlyShowPayElsewhere?: boolean;
};

type ShowBankPaySkippedModalParams = {
    /** The bank account picked to pay with, which the title names */
    bankAccountID?: number;

    /** The workspace whose bank account names the title in a bulk payment, which can span several */
    policy?: OnyxEntry<Policy>;

    /** Reports a bulk payment left unpaid while it paid the others. Leave it empty when nothing was paid */
    skippedReports?: BankPaySkippedReport[];
};

function useBankPaySkippedModal({bankAccountList, report, policy, onlyShowPayElsewhere = false}: UseBankPaySkippedModalParams) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    // Nothing is owed on the report, so the bank account stays on offer and picking it explains why it can't pay instead of hiding it
    const isBankPayBlocked = onlyShowPayElsewhere && isBankPayBlockedBySpend(report, policy);

    const showBankPaySkippedModal = ({bankAccountID, policy: titlePolicy = policy, skippedReports = []}: ShowBankPaySkippedModalParams = {}) => {
        const bankAccount = bankAccountID ? bankAccountList?.[bankAccountID] : getAccessiblePolicyBankAccount(titlePolicy, bankAccountList);
        const title = translate('iou.payWithBankAccountTitle', bankAccount?.accountData?.accountNumber?.slice(-4));
        const confirmText = translate('common.buttonConfirm');

        if (!report && skippedReports.length > 0) {
            // A bulk payment can skip dozens of reports, so the names scroll under a fixed description to keep Got it on screen
            return showConfirmModal({
                title,
                subtitle: translate('iou.bankPaySkippedReportsDescription'),
                prompt: skippedReports.map(({reportName}) => `${CONST.DOT_SEPARATOR} ${reportName}`).join('\n'),
                confirmText,
                shouldShowCancelButton: false,
                shouldEnablePromptScroll: true,
            });
        }

        return showConfirmModal({
            title,
            prompt: translate(report ? 'iou.bankPayReportSkippedDescription' : 'iou.bankPayAllReportsSkippedDescription'),
            confirmText,
            shouldShowCancelButton: false,
        });
    };

    return {isBankPayBlocked, showBankPaySkippedModal};
}

export default useBankPaySkippedModal;
export type {BankPaySkippedReport};
