import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';

type MultifactorAuthenticationRevokeConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

function MultifactorAuthenticationRevokeConfirmModal({isVisible, onConfirm, onCancel}: MultifactorAuthenticationRevokeConfirmModalProps) {
    const {translate} = useLocalize();

    return (
        <ConfirmModal
            danger
            title={translate('common.areYouSure')}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isVisible={isVisible}
            prompt={translate('multifactorAuthentication.revokePage.confirmationContent')}
            confirmText={translate('multifactorAuthentication.revokePage.bottomButtonContent')}
            cancelText={translate('common.cancel')}
            shouldDisableConfirmButtonWhenOffline
            shouldShowCancelButton
        />
    );
}

MultifactorAuthenticationRevokeConfirmModal.displayName = 'MultifactorAuthenticationRevokeConfirmModal';

export default MultifactorAuthenticationRevokeConfirmModal;
