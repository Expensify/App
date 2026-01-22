import React from 'react';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import type {ModalProps} from './ModalContext';

type HoldOrRejectEducationalModalWrapperProps = ModalProps;

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
