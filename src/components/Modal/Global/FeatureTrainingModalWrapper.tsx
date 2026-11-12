import type {FeatureTrainingModalProps} from '@components/FeatureTrainingModal';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import withNavigationFallback from '@components/withNavigationFallback';

import React, {useRef} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type FeatureTrainingModalWrapperProps = ModalProps & Omit<FeatureTrainingModalProps, 'onConfirm' | 'onClose'>;

// This wrapper bridges the FeatureTrainingModal API with the global modal system, resolving the caller's promise with CONFIRM or CLOSE.
function FeatureTrainingModalWrapper({closeModal, resolveModal, shouldCloseOnConfirm = true, ...props}: FeatureTrainingModalWrapperProps) {
    const closeActionRef = useRef<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);

    // `closeModal` pops whatever sits on top of the stack, so it must only run once for this entry
    const hasClosedRef = useRef(false);

    const close = () => {
        if (hasClosedRef.current) {
            return;
        }
        hasClosedRef.current = true;
        closeModal({action: closeActionRef.current});
    };

    const handleConfirm = () => {
        closeActionRef.current = ModalActions.CONFIRM;
        // When the modal closes on confirm, it reports onClose once it has hidden, and that pops the entry
        if (shouldCloseOnConfirm) {
            return;
        }
        close();
    };

    return (
        <FeatureTrainingModal
            {...props}
            shouldCloseOnConfirm={shouldCloseOnConfirm}
            onConfirm={handleConfirm}
            onClose={close}
        />
    );
}

// The global modal stack renders above NavigationRoot, but the modal's confirm button reads navigation focus
export default withNavigationFallback(FeatureTrainingModalWrapper);
