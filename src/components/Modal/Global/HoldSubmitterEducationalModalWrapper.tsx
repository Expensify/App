import React from 'react';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import {ModalActions} from './ModalContext';
import type {ModalProps} from './ModalContext';

function HoldSubmitterEducationalModalWrapper({closeModal}: ModalProps) {
    return (
        <HoldSubmitterEducationalModal
            onClose={() => closeModal({action: ModalActions.CLOSE})}
            onConfirm={() => closeModal({action: ModalActions.CONFIRM})}
        />
    );
}

export default HoldSubmitterEducationalModalWrapper;
