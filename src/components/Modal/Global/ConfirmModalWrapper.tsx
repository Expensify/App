import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModal from '@components/ConfirmModal';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import type {ModalProps} from './ModalContext';

const ConfirmModalActions = {
    CONFIRM: 'CONFIRM',
    CLOSE: 'CLOSE',
} as const;

type ConfirmModalAction = ValueOf<typeof ConfirmModalActions>;

type ConfirmModalWrapperProps = ModalProps<ConfirmModalAction> & Omit<ConfirmModalProps, 'onConfirm' | 'onCancel' | 'isVisible'>;

// This wrapper bridges the ConfirmModal API with the global modal system, providing handlers for the onConfirm and onCancel callbacks to ConfirmModal.
// TODOS after migrating all ConfirmModal instances to use showConfirmModal:
// - handle closeModal inside ConfirmModal
// - remove ConfirmModalWrapper

function ConfirmModalWrapper({closeModal, ...props}: ConfirmModalWrapperProps) {
    const activeElementRole = useActiveElementRole();
    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<ConfirmModalAction>(ConfirmModalActions.CLOSE);

    const handleConfirm = () => {
        setCloseAction(ConfirmModalActions.CONFIRM);
        setIsVisible(false);
    };

    const handleCancel = () => {
        setCloseAction(ConfirmModalActions.CLOSE);
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

export default ConfirmModalWrapper;
export {ConfirmModalActions};
export type {ConfirmModalAction};
