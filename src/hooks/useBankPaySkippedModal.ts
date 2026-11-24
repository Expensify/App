/**
 * Shows the alert explaining why reports that are non-reimbursable or total $0 or less weren't paid through the bank account,
 * for a single report, for some reports of a bulk payment, or for a bulk payment where none could be paid.
 */
import {getLastFourDigits} from '@libs/BankAccountUtils';
import formatReportNamesAsBulletList from '@libs/formatReportNamesAsBulletList';
import {getAccessiblePolicyBankAccount} from '@libs/PolicyPaymentUtils';
import {getABAWithdrawalAccount} from '@libs/PolicyUtils';

import type {BankAccountList, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

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

    /** Whether the payment is an ABA file, which pays from the workspace's AU withdrawal account */
    isABAPayment?: boolean;

    /** The reports a bulk payment skipped after paying others. Left out when it paid none of them */
    skippedReportNames?: string[];
};

function useBankPaySkippedModal({bankAccountList}: UseBankPaySkippedModalParams) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const showBankPaySkippedModal = ({bankAccountID, policy, isSingleReport = false, isABAPayment = false, skippedReportNames}: ShowBankPaySkippedModalParams) => {
        const payingBankAccountID = isABAPayment ? getABAWithdrawalAccount(policy)?.bankAccountID : bankAccountID;
        const bankAccount = payingBankAccountID ? bankAccountList?.[payingBankAccountID] : getAccessiblePolicyBankAccount(policy, bankAccountList);
        const title = translate('walletPage.wiseGlobalReimbursementsBulkPayModal.title', getLastFourDigits(bankAccount?.accountData?.accountNumber ?? ''));
        const confirmText = translate('common.buttonConfirm');

        if (skippedReportNames) {
            // A bulk payment can skip dozens of reports, so the names scroll under a fixed description to keep Got it on screen
            return showConfirmModal({
                title,
                subtitle: translate('iou.bankPaySkippedReportsDescription'),
                prompt: formatReportNamesAsBulletList(skippedReportNames),
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
