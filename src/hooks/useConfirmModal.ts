import ConfirmModalWrapper from '@components/Modal/Global/ConfirmModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type ConfirmModalOptions = Omit<React.ComponentProps<typeof ConfirmModalWrapper>, keyof ModalProps> & {
    id?: string;
};

const useConfirmModal = () => {
    const context = useModal();

    const showConfirmModal = ({id, ...options}: ConfirmModalOptions) => {
        return context.showModal({
            component: ConfirmModalWrapper,
            id,
            props: {
                shouldHandleNavigationBack: true,
                ...options,
            },
        });
    };

    return {
        ...context,
        closeModal: () => context.closeModal(),
        showConfirmModal,
    };
};
export default useConfirmModal;
