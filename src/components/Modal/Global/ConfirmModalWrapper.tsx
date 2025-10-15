import React, {useCallback, useMemo, useState} from 'react';
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
    const [isClosing, setIsClosing] = useState(false);
    const [closeAction, setCloseAction] = useState<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);

    const handleConfirm = useCallback(() => {
        setCloseAction(ModalActions.CONFIRM);
        setIsClosing(true);
    }, []);

    const handleCancel = useCallback(() => {
        setCloseAction(ModalActions.CLOSE);
        setIsClosing(true);
    }, []);

    const handleModalHide = useCallback(() => {
        if (!isClosing) {
            return;
        }
        closeModal({action: closeAction});
    }, [isClosing, closeModal, closeAction]);

    const shortcutConfig = useMemo(
        () => ({
            isActive: activeElementRole !== CONST.ROLE.BUTTON,
            shouldPreventDefault: false,
            shouldBubble: false,
        }),
        [activeElementRole],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, handleConfirm, shortcutConfig);

    return (
        <ConfirmModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVisible={!isClosing}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onModalHide={handleModalHide}
        />
    );
}

ConfirmModalWrapper.displayName = 'ConfirmModalWrapper';

export default ConfirmModalWrapper;
