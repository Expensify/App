import type {DecisionModalProps} from '@components/DecisionModal';
import DecisionModal from '@components/DecisionModal';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import React, {useState} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type DecisionModalWrapperProps = ModalProps &
    Omit<DecisionModalProps, 'onClose' | 'onSecondOptionSubmit' | 'onFirstOptionSubmit' | 'isVisible' | 'isSmallScreenWidth'> & {
        /** Whether dismissing the modal (backdrop, Escape, or Back) resolves with `ModalActions.DISMISS` instead of the second option's `ModalActions.CLOSE` */
        shouldReportDismiss?: boolean;
    };

function DecisionModalWrapper({closeModal, onModalHide, shouldReportDismiss = false, ...props}: DecisionModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE | typeof ModalActions.DISMISS>(ModalActions.CLOSE);
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

    const handleDismiss = () => {
        setCloseAction(shouldReportDismiss ? ModalActions.DISMISS : ModalActions.CLOSE);
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

            {...props}
            isVisible={isVisible}
            isSmallScreenWidth={isSmallScreenWidth}
            onFirstOptionSubmit={handleFirstOption}
            onSecondOptionSubmit={handleSecondOption}
            onClose={handleDismiss}
            onModalHide={handleModalHide}
        />
    );
}

export default DecisionModalWrapper;
