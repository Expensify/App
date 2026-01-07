import ConfirmModalWrapper from '@components/Modal/Global/ConfirmModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
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

    return {
        ...context,
        showConfirmModal,
    };
};
export default useConfirmModal;
