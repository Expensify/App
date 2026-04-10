import type {OnyxEntry} from 'react-native-onyx';
import {hasOnlyNonReimbursableTransactions, isInvoiceReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import useDecisionModal from './useDecisionModal';
import useLocalize from './useLocalize';

type UseNonReimbursablePaymentModalReturn = {
    showNonReimbursablePaymentErrorModal: () => void;
    shouldBlockDirectPayment: (paymentType: PaymentMethodType) => boolean;
};

/** Blocks direct payment and shows the error modal when the report contains only non-reimbursable expenses. */
function useNonReimbursablePaymentModal(iouReport: OnyxEntry<Report>, transactions?: Transaction[]): UseNonReimbursablePaymentModalReturn {
    const {translate} = useLocalize();
    const {showDecisionModal} = useDecisionModal();

    const showNonReimbursablePaymentErrorModal = () => {
        showDecisionModal({
            title: translate('iou.error.nonReimbursablePayment'),
            prompt: translate('iou.error.nonReimbursablePaymentDescription', false),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

    const shouldBlockDirectPayment = (paymentType: PaymentMethodType): boolean =>
        !isInvoiceReport(iouReport) && hasOnlyNonReimbursableTransactions(iouReport?.reportID, transactions) && paymentType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE;

    return {
        showNonReimbursablePaymentErrorModal,
        shouldBlockDirectPayment,
    };
}

export default useNonReimbursablePaymentModal;
