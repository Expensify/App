import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';

type MFAApproveTransactionConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

function MFAApproveTransactionConfirmModal({isVisible, onConfirm, onCancel}: MFAApproveTransactionConfirmModalProps) {
    const {translate} = useLocalize();

    return (
        <ConfirmModal
            danger
            title={translate('common.areYouSure')}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isVisible={isVisible}
            prompt={translate('multiFactorAuthentication.approveTransaction.denyTransactionContent')}
            confirmText={translate('multiFactorAuthentication.approveTransaction.denyTransactionButton')}
            cancelText={translate('common.cancel')}
            shouldShowCancelButton
        />
    );
}

MFAApproveTransactionConfirmModal.displayName = 'MFAApproveTransactionConfirmModal';

export default MFAApproveTransactionConfirmModal;

