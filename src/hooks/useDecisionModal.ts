import DecisionModalWrapper from '@components/Modal/Global/DecisionModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type DecisionModalOptions = Omit<React.ComponentProps<typeof DecisionModalWrapper>, keyof ModalProps>;

const useDecisionModal = () => {
    const context = useModal();

    const showDecisionModal = (options: DecisionModalOptions) => {
        return context.showModal({
            component: DecisionModalWrapper,
            props: {
                shouldHandleNavigationBack: true,
                ...options,
            },
        });
    };

    return {
        ...context,
        closeModal: () => context.closeModal(),
        showDecisionModal,
    };
};

export default useDecisionModal;
