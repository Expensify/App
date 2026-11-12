/**
 * Shows the alert explaining why reports that are non-reimbursable or total $0 or less weren't paid through the bank account,
 * for a single report, for some reports of a bulk payment, or for a bulk payment where none could be paid.
 */
import {getAccessiblePolicyBankAccount} from '@libs/PolicyPaymentUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type BankPaySkippedReport = {
    reportID: string;
    reportName: string;
};

type ShowBankPaySkippedModalParams = {
    /** The bank account picked to pay with, which the title names */
    bankAccountID?: number;

    /** The workspace whose bank account the title names when none was picked */
    policy?: OnyxEntry<Policy>;

    /** Reports left unpaid while the others were paid. Leave it empty when nothing was paid */
    skippedReports?: BankPaySkippedReport[];

    /** Whether one report was paid from the report rather than a selection in bulk */
    isSingleReport?: boolean;
};

function useBankPaySkippedModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const showBankPaySkippedModal = ({bankAccountID, policy, skippedReports = [], isSingleReport = false}: ShowBankPaySkippedModalParams) => {
        const bankAccount = bankAccountID ? bankAccountList?.[bankAccountID] : getAccessiblePolicyBankAccount(policy, bankAccountList);
        const accountNumber = bankAccount?.accountData?.accountNumber;

        const title = translate('iou.payWithBankAccountTitle', accountNumber?.slice(-4));
        const confirmText = translate('common.buttonConfirm');

        if (!isSingleReport && skippedReports.length > 0) {
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
