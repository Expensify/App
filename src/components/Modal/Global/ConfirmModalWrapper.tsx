import React, {useCallback} from 'react';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModal from '@components/ConfirmModal';
import type {ModalProps} from './ModalContext';

type ConfirmModalWrapperProps = ModalProps & Omit<ConfirmModalProps, 'onConfirm' | 'onCancel' | 'isVisible'>;

// This wrapper bridges the ConfirmModal API with the global modal system, providing handlers for the onConfirm and onCancel callbacks to ConfirmModal.
// TODOS after migrating all ConfirmModal instances to use showConfirmModal:
// - handle closeModal inside ConfirmModal
// - remove ConfirmModalWrapper

function ConfirmModalWrapper({
    closeModal,
    title = '',
    prompt = '',
    confirmText = '',
    cancelText = '',
    success = true,
    danger = false,
    shouldDisableConfirmButtonWhenOffline = false,
    shouldShowCancelButton = true,
    shouldSetModalVisibility = true,
    shouldShowDismissIcon = false,
    shouldCenterContent = false,
    shouldStackButtons = true,
    shouldReverseStackedButtons = false,
    isConfirmLoading = false,
}: ConfirmModalWrapperProps) {
    const handleConfirm = useCallback(() => {
        closeModal({action: 'CONFIRM'});
    }, [closeModal]);

    const handleCancel = useCallback(() => {
        closeModal({action: 'CLOSE'});
    }, [closeModal]);

    return (
        <ConfirmModal
            title={title}
            isVisible
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            prompt={prompt}
            confirmText={confirmText}
            cancelText={cancelText}
            success={success}
            danger={danger}
            shouldDisableConfirmButtonWhenOffline={shouldDisableConfirmButtonWhenOffline}
            shouldShowCancelButton={shouldShowCancelButton}
            shouldSetModalVisibility={shouldSetModalVisibility}
            shouldShowDismissIcon={shouldShowDismissIcon}
            shouldCenterContent={shouldCenterContent}
            shouldStackButtons={shouldStackButtons}
            shouldReverseStackedButtons={shouldReverseStackedButtons}
            isConfirmLoading={isConfirmLoading}
        />
    );
}

ConfirmModalWrapper.displayName = 'ConfirmModalWrapper';

export default ConfirmModalWrapper;
