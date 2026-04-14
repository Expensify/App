import React from 'react';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import {ModalActions} from './ModalContext';
import type {ModalProps} from './ModalContext';

function HoldOrRejectEducationalModalWrapper({closeModal}: ModalProps) {
    return (
        <HoldOrRejectEducationalModal
            onClose={() => closeModal({action: ModalActions.CLOSE})}
            onConfirm={() => closeModal({action: ModalActions.CONFIRM})}
        />
    );
}

export default HoldOrRejectEducationalModalWrapper;
