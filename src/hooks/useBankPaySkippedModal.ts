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

        let prompt = translate('iou.bankPayAllReportsSkippedDescription');
        if (isSingleReport) {
            prompt = translate('iou.bankPayReportSkippedDescription');
        } else if (skippedReports.length > 0) {
            const reportLines = skippedReports.map(({reportName}) => `${CONST.DOT_SEPARATOR} ${reportName}`);
            prompt = [translate('iou.bankPaySkippedReportsDescription'), '', ...reportLines].join('\n');
        }

        return showConfirmModal({
            title: translate('iou.payWithBankAccountTitle', accountNumber?.slice(-4)),
            prompt,
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    return {showBankPaySkippedModal};
}

export default useBankPaySkippedModal;
export type {BankPaySkippedReport};
