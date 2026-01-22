import DecisionModalWrapper from '@components/Modal/Global/DecisionModalWrapper';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type DecisionModalOptions = Omit<React.ComponentProps<typeof DecisionModalWrapper>, keyof ModalProps>;

const DecisionModalActions = {
    FIRST_OPTION: 'FIRST_OPTION',
    SECOND_OPTION: 'SECOND_OPTION',
    CLOSE: 'CLOSE',
} as const;

const useDecisionModal = () => {
    const context = useModal();

    const showDecisionModal = (options: DecisionModalOptions) => {
        return context.showModal({
            component: DecisionModalWrapper,
            props: options,
        });
    };

    return {
        ...context,
        showDecisionModal,
        DecisionModalActions,
    };
};

export default useDecisionModal;
export {DecisionModalActions};
