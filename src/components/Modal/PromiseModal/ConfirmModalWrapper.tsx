import React from 'react';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModal from '@components/ConfirmModal';
import type {ModalProps} from './ModalContext';

type ConfirmModalWrapperProps = ModalProps & Omit<ConfirmModalProps, 'onConfirm' | 'onCancel' | 'isVisible'>;

// This wrapper component can be removed after migrating all the ConfirmModal components to use the promise-based modal architecture
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
    const handleConfirm = () => {
        closeModal({action: 'CONFIRM'});
    };

    const handleCancel = () => {
        closeModal({action: 'CLOSE'});
    };

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
