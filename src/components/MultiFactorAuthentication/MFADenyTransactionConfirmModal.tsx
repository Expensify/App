import React, {memo} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';

type MFADenyTransactionConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

function MFADenyTransactionConfirmModal({isVisible, onConfirm, onCancel}: MFADenyTransactionConfirmModalProps) {
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

MFADenyTransactionConfirmModal.displayName = 'MFADenyTransactionConfirmModal';

export default memo(MFADenyTransactionConfirmModal);
