import WiseQuotePaymentSummary from '@components/WisePaymentSummary/components/WiseQuotePaymentSummary';

import React from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

type WiseQuoteConfirmModalOptions = {
    reportID: string | undefined;

    /** True when the admin chose to pay only the expenses that are not on hold */
    isPayingUnheldOnly: boolean;
};

/** Shows the Wise quote for a report so the admin confirms the fees and rate before Pay, as Wise requires */
function useWiseQuoteConfirmModal() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const showWiseQuoteConfirmModal = ({reportID, isPayingUnheldOnly}: WiseQuoteConfirmModalOptions) =>
        showConfirmModal({
            id: 'wiseQuoteConfirmModal',
            title: translate('iou.wisePaymentSummary.confirmPayment'),
            prompt: (
                <WiseQuotePaymentSummary
                    reportID={reportID}
                    isPayingUnheldOnly={isPayingUnheldOnly}
                />
            ),
            confirmText: translate('iou.pay'),
            cancelText: translate('common.cancel'),
            shouldDisableConfirmButtonWhenOffline: true,
        });

    return {showWiseQuoteConfirmModal};
}

export default useWiseQuoteConfirmModal;
