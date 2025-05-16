import React from 'react';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type AccountLockedModalProps = {
    isLockedAccountModalOpen: boolean;
    hideLockedAccountModal: () => void;
};

function LockedAccountModal({isLockedAccountModalOpen, hideLockedAccountModal}: AccountLockedModalProps) {
    const {translate} = useLocalize();
    return (
        <ConfirmModal
            title={translate('lockedAccount.title')}
            isVisible={isLockedAccountModalOpen}
            onConfirm={hideLockedAccountModal}
            prompt={translate('lockedAccount.description')}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
        />
    );
}

LockedAccountModal.displayName = 'LockedAccountModal';

export default LockedAccountModal;
