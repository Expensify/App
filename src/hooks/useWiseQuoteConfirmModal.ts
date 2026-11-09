import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';
import type {WiseQuoteCarouselModalWrapperProps} from '@components/Modal/Global/WiseQuoteCarouselModalWrapper';
import WiseQuoteCarouselModalWrapper from '@components/Modal/Global/WiseQuoteCarouselModalWrapper';
import type {WiseQuoteConfirmModalWrapperProps} from '@components/Modal/Global/WiseQuoteConfirmModalWrapper';
import WiseQuoteConfirmModalWrapper from '@components/Modal/Global/WiseQuoteConfirmModalWrapper';

type WiseQuoteConfirmModalOptions = Omit<WiseQuoteConfirmModalWrapperProps, keyof ModalProps>;
type WiseQuoteCarouselModalOptions = Omit<WiseQuoteCarouselModalWrapperProps, keyof ModalProps>;

/** Shows Wise quotes so the admin confirms the fees and rates before Pay: one report, or a carousel for bulk pay */
function useWiseQuoteConfirmModal() {
    const context = useModal();

    const showWiseQuoteConfirmModal = (options: WiseQuoteConfirmModalOptions) =>
        context.showModal({
            component: WiseQuoteConfirmModalWrapper,
            props: options,
        });

    const showWiseQuoteCarouselModal = (options: WiseQuoteCarouselModalOptions) =>
        context.showModal({
            component: WiseQuoteCarouselModalWrapper,
            props: options,
        });

    return {showWiseQuoteConfirmModal, showWiseQuoteCarouselModal};
}

export default useWiseQuoteConfirmModal;
