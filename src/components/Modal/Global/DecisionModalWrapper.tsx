import React, {useState} from 'react';
import DecisionModal from '@components/DecisionModal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {ModalActions} from './ModalContext';
import type {ModalProps} from './ModalContext';

type DecisionModalWrapperProps = ModalProps & Omit<React.ComponentProps<typeof DecisionModal>, 'isVisible' | 'onClose' | 'isSmallScreenWidth' | 'onModalHide'>;

function DecisionModalWrapper({closeModal, ...props}: DecisionModalWrapperProps) {
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<string>(ModalActions.CLOSE);

    const handleFirstOption = () => {
        setCloseAction('FIRST_OPTION');
        setIsVisible(false);
    };

    const handleSecondOption = () => {
        setCloseAction('SECOND_OPTION');
        setIsVisible(false);
    };

    const handleClose = () => {
        setCloseAction(ModalActions.CLOSE);
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
            isSmallScreenWidth={isSmallScreenWidth}
            onFirstOptionSubmit={props.firstOptionText ? handleFirstOption : undefined}
            onSecondOptionSubmit={handleSecondOption}
            onClose={handleClose}
            onModalHide={handleModalHide}
        />
    );
}

export default DecisionModalWrapper;
