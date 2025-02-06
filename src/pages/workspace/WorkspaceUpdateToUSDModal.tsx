import React, {useEffect} from 'react';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import ConfirmModal from '@components/ConfirmModal';
import CONST from '@src/CONST';

function WorkspaceUpdateToUSDModal({
    title,
    isVisible,
    onConfirm,
    onCancel,
    prompt,
    confirmText,
    cancelText,
    danger,
    workspaceCurrency,
}: ConfirmModalProps & {workspaceCurrency: string | undefined}) {
    useEffect(() => {
        if (!isVisible || workspaceCurrency !== CONST.CURRENCY.USD) {
            return;
        }

        onCancel?.();
    }, [workspaceCurrency, isVisible, onCancel]);

    return (
        <ConfirmModal
            title={title}
            isVisible={isVisible}
            onConfirm={onConfirm}
            onCancel={onCancel}
            prompt={prompt}
            confirmText={confirmText}
            cancelText={cancelText}
            danger={danger}
        />
    );
}

export default WorkspaceUpdateToUSDModal;
