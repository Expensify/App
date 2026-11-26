import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {ModalActions, useModal} from '@components/Modal/Global/ModalContext';
import type {WiseQuoteCarouselModalWrapperProps} from '@components/Modal/Global/WiseQuoteCarouselModalWrapper';
import WiseQuoteCarouselModalWrapper from '@components/Modal/Global/WiseQuoteCarouselModalWrapper';
import type {WiseQuoteConfirmModalWrapperProps} from '@components/Modal/Global/WiseQuoteConfirmModalWrapper';
import WiseQuoteConfirmModalWrapper from '@components/Modal/Global/WiseQuoteConfirmModalWrapper';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

type ExpiredQuoteOptions = {
    /** Replaces the expired quotes after the admin asks for new ones */
    getNewQuotes: () => void;
};

type WiseQuoteConfirmModalOptions = Omit<WiseQuoteConfirmModalWrapperProps, keyof ModalProps | 'onQuoteExpired'> & ExpiredQuoteOptions;
type WiseQuoteCarouselModalOptions = Omit<WiseQuoteCarouselModalWrapperProps, keyof ModalProps | 'onQuoteExpired'> & ExpiredQuoteOptions;

/**
 * Shows Wise quotes so the admin confirms the fees and rates before Pay: one report, or a carousel for bulk pay.
 * Paying with an expired quote shows an alert instead, and the admin reviews new quotes before paying.
 */
function useWiseQuoteConfirmModal() {
    const context = useModal();
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();

    const showQuoteExpiredModal = (hasManyQuotes: boolean, onGetNewQuotes: () => void) => {
        showConfirmModal({
            title: translate(hasManyQuotes ? 'iou.wisePaymentSummary.fxRatesExpiredTitle' : 'iou.wisePaymentSummary.fxRateExpiredTitle'),
            prompt: translate(hasManyQuotes ? 'iou.wisePaymentSummary.fxRatesExpiredPrompt' : 'iou.wisePaymentSummary.fxRateExpiredPrompt'),
            confirmText: translate(hasManyQuotes ? 'iou.wisePaymentSummary.getLatestRates' : 'iou.wisePaymentSummary.getLatestRate'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            onGetNewQuotes();
        });
    };

    const showWiseQuoteConfirmModal = (options: WiseQuoteConfirmModalOptions) =>
        context.showModal({
            component: WiseQuoteConfirmModalWrapper,
            props: {
                ...options,
                onQuoteExpired: () =>
                    showQuoteExpiredModal(false, () => {
                        options.getNewQuotes();
                        showWiseQuoteConfirmModal(options);
                    }),
            },
        });

    const showWiseQuoteCarouselModal = (options: WiseQuoteCarouselModalOptions) =>
        context.showModal({
            component: WiseQuoteCarouselModalWrapper,
            props: {
                ...options,
                onQuoteExpired: () =>
                    showQuoteExpiredModal(options.quotedReportIDs.length > 1, () => {
                        options.getNewQuotes();
                        showWiseQuoteCarouselModal(options);
                    }),
            },
        });

    return {showWiseQuoteConfirmModal, showWiseQuoteCarouselModal};
}

export default useWiseQuoteConfirmModal;
