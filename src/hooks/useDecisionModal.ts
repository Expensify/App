import DecisionModalWrapper, {DecisionModalActions} from '@components/Modal/Global/DecisionModalWrapper';
import type {DecisionModalAction} from '@components/Modal/Global/DecisionModalWrapper';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type DecisionModalOptions = Omit<React.ComponentProps<typeof DecisionModalWrapper>, 'closeModal'>;

const useDecisionModal = () => {
    const context = useModal();

    const showDecisionModal = (options: DecisionModalOptions): Promise<ModalStateChangePayload<DecisionModalAction>> => {
        return context.showModal({
            component: DecisionModalWrapper,
            props: options,
        });
    };

    return {
        ...context,
        showDecisionModal,
    };
};

export default useDecisionModal;
export {DecisionModalActions};
export type {DecisionModalAction};
