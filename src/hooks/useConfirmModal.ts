import ConfirmModalWrapper, {ConfirmModalActions} from '@components/Modal/Global/ConfirmModalWrapper';
import type {ConfirmModalAction} from '@components/Modal/Global/ConfirmModalWrapper';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type ConfirmModalOptions = Omit<React.ComponentProps<typeof ConfirmModalWrapper>, 'closeModal'>;

const useConfirmModal = () => {
    const context = useModal();

    const showConfirmModal = (options: ConfirmModalOptions): Promise<ModalStateChangePayload<ConfirmModalAction>> => {
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
export {ConfirmModalActions};
export type {ConfirmModalAction};
