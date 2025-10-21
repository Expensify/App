import React, {useState} from 'react';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModal from '@components/ConfirmModal';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import {ModalActions} from './ModalContext';
import type {ModalProps} from './ModalContext';

type ConfirmModalWrapperProps = ModalProps & Omit<ConfirmModalProps, 'onConfirm' | 'onCancel' | 'isVisible'>;

// This wrapper bridges the ConfirmModal API with the global modal system, providing handlers for the onConfirm and onCancel callbacks to ConfirmModal.
// TODOS after migrating all ConfirmModal instances to use showConfirmModal:
// - handle closeModal inside ConfirmModal
// - remove ConfirmModalWrapper

function ConfirmModalWrapper({closeModal, ...props}: ConfirmModalWrapperProps) {
    const activeElementRole = useActiveElementRole();
    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);

    const handleConfirm = () => {
        setCloseAction(ModalActions.CONFIRM);
        setIsVisible(false);
    };

    const handleCancel = () => {
        setCloseAction(ModalActions.CLOSE);
        setIsVisible(false);
    };

    const handleModalHide = () => {
        if (isVisible) {
            return;
        }
        closeModal({action: closeAction});
    };

    const shortcutConfig = {
        isActive: activeElementRole !== CONST.ROLE.BUTTON,
        shouldPreventDefault: false,
        shouldBubble: false,
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, handleConfirm, shortcutConfig);

    return (
        <ConfirmModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVisible={isVisible}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onModalHide={handleModalHide}
        />
    );
}

ConfirmModalWrapper.displayName = 'ConfirmModalWrapper';

export default ConfirmModalWrapper;
