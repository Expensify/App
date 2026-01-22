import React from 'react';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import type {ModalProps} from './ModalContext';

type HoldSubmitterEducationalModalWrapperProps = ModalProps;

// This wrapper bridges the HoldSubmitterEducationalModal API with the global modal system, providing handlers for the onClose and onConfirm callbacks.
// TODO after all HoldSubmitterEducationalModal instances migrate to use showHoldEducationalModal:
// - Update HoldSubmitterEducationalModal (and its base FeatureTrainingModal) to accept closeModal directly
// - Remove HoldSubmitterEducationalModalWrapper

function HoldSubmitterEducationalModalWrapper({closeModal}: HoldSubmitterEducationalModalWrapperProps) {
    const handleConfirm = () => {
        closeModal({action: 'CONFIRMED'});
    };

    const handleClose = () => {
        closeModal({action: 'CONFIRMED'});
    };

    // HoldSubmitterEducationalModal uses FeatureTrainingModal which handles its own visibility
    // We need to intercept the callbacks and signal completion
    return (
        <HoldSubmitterEducationalModal
            onClose={handleClose}
            onConfirm={handleConfirm}
        />
    );
}

export default HoldSubmitterEducationalModalWrapper;
