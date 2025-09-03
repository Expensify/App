import React, {useCallback} from 'react';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModal from '@components/ConfirmModal';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import type {ModalProps} from './ModalContext';

type ConfirmModalWrapperProps = ModalProps & Omit<ConfirmModalProps, 'onConfirm' | 'onCancel' | 'isVisible'>;

// This wrapper bridges the ConfirmModal API with the global modal system, providing handlers for the onConfirm and onCancel callbacks to ConfirmModal.
// TODOS after migrating all ConfirmModal instances to use showConfirmModal:
// - handle closeModal inside ConfirmModal
// - remove ConfirmModalWrapper

function ConfirmModalWrapper({closeModal, ...props}: ConfirmModalWrapperProps) {
    const handleConfirm = useCallback(() => {
        closeModal({action: 'CONFIRM'});
    }, [closeModal]);

    const handleCancel = useCallback(() => {
        closeModal({action: 'CLOSE'});
    }, [closeModal]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, handleConfirm);

    return (
        <ConfirmModal
            isVisible
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

ConfirmModalWrapper.displayName = 'ConfirmModalWrapper';

export default ConfirmModalWrapper;
