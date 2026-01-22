import React from 'react';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import type {ModalProps} from './ModalContext';

type HoldOrRejectEducationalModalWrapperProps = ModalProps;

// This wrapper bridges the HoldOrRejectEducationalModal API with the global modal system, providing handlers for the onClose and onConfirm callbacks.
// TODO after all HoldOrRejectEducationalModal instances migrate to use showHoldEducationalModal:
// - Update HoldOrRejectEducationalModal (and its base FeatureTrainingModal) to accept closeModal directly
// - Remove HoldOrRejectEducationalModalWrapper

function HoldOrRejectEducationalModalWrapper({closeModal}: HoldOrRejectEducationalModalWrapperProps) {
    const handleConfirm = () => {
        closeModal({action: 'CONFIRMED'});
    };

    const handleClose = () => {
        closeModal({action: 'CONFIRMED'});
    };

    // HoldOrRejectEducationalModal uses FeatureTrainingModal which handles its own visibility
    // We need to intercept the callbacks and signal completion
    return (
        <HoldOrRejectEducationalModal
            onClose={handleClose}
            onConfirm={handleConfirm}
        />
    );
}

export default HoldOrRejectEducationalModalWrapper;
