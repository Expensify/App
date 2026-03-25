import React, {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DecisionModal from '@components/DecisionModal';
import {hasOnlyNonReimbursableTransactions, isInvoiceReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import useLocalize from './useLocalize';
import useResponsiveLayout from './useResponsiveLayout';

type UseNonReimbursablePaymentModalReturn = {
    showNonReimbursablePaymentErrorModal: () => void;
    shouldBlockDirectPayment: (paymentType: PaymentMethodType) => boolean;
    nonReimbursablePaymentErrorDecisionModal: React.ReactNode;
};

/** Blocks direct payment and shows the error modal when the report contains only non-reimbursable expenses. */
function useNonReimbursablePaymentModal(iouReport: OnyxEntry<Report>, transactions?: Transaction[]): UseNonReimbursablePaymentModalReturn {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth here because the DecisionModal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const showNonReimbursablePaymentErrorModal = () => setIsModalVisible(true);

    const shouldBlockDirectPayment = (paymentType: PaymentMethodType): boolean =>
        !isInvoiceReport(iouReport) && hasOnlyNonReimbursableTransactions(iouReport?.reportID, transactions) && paymentType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE;

    const nonReimbursablePaymentErrorDecisionModal = (
        <DecisionModal
            title={translate('iou.error.nonReimbursablePayment')}
            prompt={translate('iou.error.nonReimbursablePaymentDescription', false)}
            isSmallScreenWidth={isSmallScreenWidth}
            onSecondOptionSubmit={() => setIsModalVisible(false)}
            secondOptionText={translate('common.buttonConfirm')}
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
        />
    );

    return {
        showNonReimbursablePaymentErrorModal,
        shouldBlockDirectPayment,
        nonReimbursablePaymentErrorDecisionModal,
    };
}

export default useNonReimbursablePaymentModal;
