import React from 'react';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import type {ModalProps} from './ModalContext';

type HoldSubmitterEducationalModalWrapperProps = ModalProps;

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
