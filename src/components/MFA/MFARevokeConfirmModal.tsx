import React, {memo} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';

type MFARevokeConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

function MFARevokeConfirmModal({isVisible, onConfirm, onCancel}: MFARevokeConfirmModalProps) {
    const {translate} = useLocalize();

    return (
        <ConfirmModal
            danger
            title={translate('common.areYouSure')}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isVisible={isVisible}
            prompt={translate('multiFactorAuthentication.revokePage.confirmationContent')}
            confirmText={translate('multiFactorAuthentication.revokePage.bottomButtonContent')}
            cancelText={translate('common.cancel')}
            shouldDisableConfirmButtonWhenOffline
            shouldShowCancelButton
        />
    );
}

MFARevokeConfirmModal.displayName = 'MFARevokeConfirmModal';

export default memo(MFARevokeConfirmModal);
