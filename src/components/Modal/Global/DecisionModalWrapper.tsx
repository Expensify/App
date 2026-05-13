import React, {useState} from 'react';
import type {DecisionModalProps} from '@components/DecisionModal';
import DecisionModal from '@components/DecisionModal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {ModalActions} from './ModalContext';
import type {ModalProps} from './ModalContext';

type DecisionModalWrapperProps = ModalProps & Omit<DecisionModalProps, 'onClose' | 'onSecondOptionSubmit' | 'onFirstOptionSubmit' | 'isVisible' | 'isSmallScreenWidth'>;

function DecisionModalWrapper({closeModal, onModalHide, ...props}: DecisionModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);
    // We need to use isSmallScreenWidth here because the DecisionModal breaks in RHP with shouldUseNarrowLayout.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const handleFirstOption = () => {
        setCloseAction(ModalActions.CONFIRM);
        setIsVisible(false);
    };

    const handleSecondOption = () => {
        setCloseAction(ModalActions.CLOSE);
        setIsVisible(false);
    };

    const handleModalHide = () => {
        if (isVisible) {
            return;
        }
        closeModal({action: closeAction});
        onModalHide?.();
    };

    return (
        <DecisionModal
            // Spreading is needed to forward all modal configuration props from the wrapper to the underlying DecisionModal.
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVisible={isVisible}
            isSmallScreenWidth={isSmallScreenWidth}
            onFirstOptionSubmit={handleFirstOption}
            onSecondOptionSubmit={handleSecondOption}
            onClose={handleSecondOption}
            onModalHide={handleModalHide}
        />
    );
}

export default DecisionModalWrapper;
