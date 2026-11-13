/**
 * Shows the alert explaining why reports that are non-reimbursable or total $0 or less weren't paid through the bank account,
 * for a single report, for some reports of a bulk payment, or for a bulk payment where none could be paid.
 */
import {getAccessiblePolicyBankAccount} from '@libs/PolicyPaymentUtils';

import CONST from '@src/CONST';
import type {BankAccountList, Policy} from '@src/types/onyx';

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
};

type ShowBankPaySkippedModalParams = {
    /** The bank account picked to pay with, which the title names */
    bankAccountID?: number;

    /** The workspace whose bank account the title names when none was picked */
    policy?: OnyxEntry<Policy>;

    /** Whether one report was paid from its own Pay button rather than a selection in bulk */
    isSingleReport?: boolean;

    /**
     * Set when a bulk payment paid some reports and skipped these, to list them by name.
     * Left out when it paid none of them. A skipped report without a name is simply missing from the list.
     */
    skippedReports?: BankPaySkippedReport[];
};

function useBankPaySkippedModal({bankAccountList}: UseBankPaySkippedModalParams) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const showBankPaySkippedModal = ({bankAccountID, policy, isSingleReport = false, skippedReports}: ShowBankPaySkippedModalParams) => {
        const bankAccount = bankAccountID ? bankAccountList?.[bankAccountID] : getAccessiblePolicyBankAccount(policy, bankAccountList);
        const title = translate('iou.payWithBankAccountTitle', bankAccount?.accountData?.accountNumber?.slice(-4));
        const confirmText = translate('common.buttonConfirm');

        if (!isSingleReport && skippedReports) {
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
            prompt: translate(isSingleReport ? 'iou.bankPayReportSkippedDescription' : 'iou.bankPayAllReportsSkippedDescription'),
            confirmText,
            shouldShowCancelButton: false,
        });
    };

    return {showBankPaySkippedModal};
}

export default useBankPaySkippedModal;
export type {BankPaySkippedReport};
