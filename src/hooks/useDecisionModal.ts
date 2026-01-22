import DecisionModalWrapper, {DecisionModalActions} from '@components/Modal/Global/DecisionModalWrapper';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

type DecisionModalAction = typeof DecisionModalActions.FIRST_OPTION | typeof DecisionModalActions.SECOND_OPTION | typeof DecisionModalActions.CLOSE;

type DecisionModalOptions = Omit<React.ComponentProps<typeof DecisionModalWrapper>, 'closeModal'>;

const useDecisionModal = () => {
    const context = useModal();

    const showDecisionModal = (options: DecisionModalOptions): Promise<ModalStateChangePayload<DecisionModalAction>> => {
        return context.showModal({
            component: DecisionModalWrapper,
            props: options,
        }) as Promise<ModalStateChangePayload<DecisionModalAction>>;
    };

    return {
        ...context,
        showDecisionModal,
    };
};

export default useDecisionModal;
export {DecisionModalActions};
export type {DecisionModalAction};
