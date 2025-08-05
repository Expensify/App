import ConfirmModalWrapper from './ConfirmModalWrapper';
import {useModal} from './ModalContext';
import type {ModalProps} from './ModalContext';

type ConfirmModalOptions = Omit<React.ComponentProps<typeof ConfirmModalWrapper>, keyof ModalProps>;

const useConfirmModal = () => {
    const context = useModal();

    const showConfirmModal = (options: ConfirmModalOptions) => {
        return context.showModal({
            component: ConfirmModalWrapper,
            props: options,
        });
    };

    return {
        ...context,
        showConfirmModal,
    };
};

export default useConfirmModal;
