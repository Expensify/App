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

function ConfirmModalWrapper({closeModal, onModalHide, resolveModal, ...props}: ConfirmModalWrapperProps) {
    const activeElementRole = useActiveElementRole();
    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);

    const handleConfirm = () => {
        setCloseAction(ModalActions.CONFIRM);
        // If isConfirmLoading is passed, don't close immediately - show loading state instead
        // The caller should use closeModal() from useConfirmModal when the async operation completes
        if (props.isConfirmLoading !== undefined) {
            setIsConfirmLoading(true);
            // Resolve the promise so the caller's .then() handler can start the async operation
            // The modal stays visible with loading state until closeModal() is called
            resolveModal({action: ModalActions.CONFIRM});
        } else {
            setIsVisible(false);
        }
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
        onModalHide?.();
    };

    const shortcutConfig = {
        isActive: activeElementRole !== CONST.ROLE.BUTTON && !isConfirmLoading,
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
            isConfirmLoading={isConfirmLoading || props.isConfirmLoading}
        />
    );
}

export default ConfirmModalWrapper;
