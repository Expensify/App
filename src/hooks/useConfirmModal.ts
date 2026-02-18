import ConfirmModalWrapper from '@components/Modal/Global/ConfirmModalWrapper';
import type {ModalProps, ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type ConfirmModalOptions = Omit<React.ComponentProps<typeof ConfirmModalWrapper>, keyof ModalProps>;

const useConfirmModal = () => {
    const context = useModal();

    const showConfirmModal = (options: ConfirmModalOptions) => {
        return context.showModal({
            component: ConfirmModalWrapper,
            props: {
                shouldHandleNavigationBack: true,
                ...options,
            },
        });
    };

    const closeConfirmModal = (data?: ModalStateChangePayload) => {
        context.closeModal(data);
    };

    return {
        ...context,
        closeModal: closeConfirmModal,
        showConfirmModal,
    };
};
export default useConfirmModal;
