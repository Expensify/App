import DecisionModalWrapper from '@components/Modal/Global/DecisionModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type DecisionModalOptions = Omit<React.ComponentProps<typeof DecisionModalWrapper>, keyof ModalProps> & {
    id?: string;
};

const useDecisionModal = () => {
    const context = useModal();

    const showDecisionModal = ({id, ...options}: DecisionModalOptions) => {
        return context.showModal({
            component: DecisionModalWrapper,
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
        showDecisionModal,
    };
};

export default useDecisionModal;
