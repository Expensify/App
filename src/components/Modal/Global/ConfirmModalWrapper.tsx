import React, {useCallback, useMemo} from 'react';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModal from '@components/ConfirmModal';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import type {ModalProps} from './ModalContext';

type ConfirmModalWrapperProps = ModalProps & Omit<ConfirmModalProps, 'onConfirm' | 'onCancel' | 'isVisible'>;

// This wrapper bridges the ConfirmModal API with the global modal system, providing handlers for the onConfirm and onCancel callbacks to ConfirmModal.
// TODOS after migrating all ConfirmModal instances to use showConfirmModal:
// - handle closeModal inside ConfirmModal
// - remove ConfirmModalWrapper

function ConfirmModalWrapper({closeModal, ...props}: ConfirmModalWrapperProps) {
    const activeElementRole = useActiveElementRole();

    const handleConfirm = useCallback(() => {
        closeModal({action: 'CONFIRM'});
    }, [closeModal]);

    const handleCancel = useCallback(() => {
        closeModal({action: 'CLOSE'});
    }, [closeModal]);

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
            isVisible
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}

ConfirmModalWrapper.displayName = 'ConfirmModalWrapper';

export default ConfirmModalWrapper;
