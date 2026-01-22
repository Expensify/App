import React, {useState} from 'react';
import DecisionModal from '@components/DecisionModal';
import type {ModalProps} from './ModalContext';

const DecisionModalActions = {
    FIRST_OPTION: 'FIRST_OPTION',
    SECOND_OPTION: 'SECOND_OPTION',
    CLOSE: 'CLOSE',
} as const;

type DecisionModalAction = typeof DecisionModalActions.FIRST_OPTION | typeof DecisionModalActions.SECOND_OPTION | typeof DecisionModalActions.CLOSE;

type DecisionModalWrapperProps = ModalProps<DecisionModalAction> & Omit<React.ComponentProps<typeof DecisionModal>, 'isVisible' | 'onClose' | 'onModalHide'>;

function DecisionModalWrapper({closeModal, ...props}: DecisionModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<DecisionModalAction>(DecisionModalActions.CLOSE);

    const handleFirstOption = () => {
        setCloseAction(DecisionModalActions.FIRST_OPTION);
        setIsVisible(false);
    };

    const handleSecondOption = () => {
        setCloseAction(DecisionModalActions.SECOND_OPTION);
        setIsVisible(false);
    };

    const handleClose = () => {
        setCloseAction(DecisionModalActions.CLOSE);
        setIsVisible(false);
    };

    const handleModalHide = () => {
        if (isVisible) {
            return;
        }
        closeModal({action: closeAction});
    };

    return (
        <DecisionModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVisible={isVisible}
            onFirstOptionSubmit={props.firstOptionText ? handleFirstOption : undefined}
            onSecondOptionSubmit={handleSecondOption}
            onClose={handleClose}
            onModalHide={handleModalHide}
        />
    );
}

export default DecisionModalWrapper;
export {DecisionModalActions};
