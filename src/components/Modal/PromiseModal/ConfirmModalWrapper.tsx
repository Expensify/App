import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import type {ModalProps} from './ModalContext';

type ConfirmModalWrapperProps = ModalProps & {
    /** Title of the modal */
    title?: string;
    /** Modal content text/element */
    prompt?: string | React.ReactNode;
    /** Confirm button text */
    confirmText?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Whether we should use the success button color */
    success?: boolean;
    /** Is the action destructive */
    danger?: boolean;
    /** Whether we should disable the confirm button when offline */
    shouldDisableConfirmButtonWhenOffline?: boolean;
    /** Whether we should show the cancel button */
    shouldShowCancelButton?: boolean;
    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;
    /** Whether to show the dismiss icon */
    shouldShowDismissIcon?: boolean;
    /** Whether to center the icon / text content */
    shouldCenterContent?: boolean;
    /** Whether to stack the buttons */
    shouldStackButtons?: boolean;
    /** Whether to reverse the order of the stacked buttons */
    shouldReverseStackedButtons?: boolean;
    /** Whether the confirm button is loading */
    isConfirmLoading?: boolean;
};

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
        closeModal({action: 'CANCEL'});
    };

    const handleClose = () => {
        closeModal({action: 'CLOSE'});
    };

    return (
        <ConfirmModal
            title={title}
            isVisible
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onClose={handleClose}
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