import React from 'react';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type AccountLockedModalProps = {
    isLockedAccountModalOpen: boolean;
    onClose: () => void;
};

function LockedAccountModal({isLockedAccountModalOpen, onClose}: AccountLockedModalProps) {
    const {translate} = useLocalize();
    return (
        <ConfirmModal
            isVisible={isLockedAccountModalOpen}
            onConfirm={onClose}
            onCancel={onClose}
            title={translate('lockedAccount.title')}
            prompt={translate('lockedAccount.description')}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
        />
    );
}

LockedAccountModal.displayName = 'LockedAccountModal';

export default LockedAccountModal;
