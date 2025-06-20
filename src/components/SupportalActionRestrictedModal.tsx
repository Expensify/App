import React from 'react';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type SupportalActionRestrictedModalProps = {
    isModalOpen: boolean;
    hideSupportalModal: () => void;
};

function SupportalActionRestrictedModal({isModalOpen, hideSupportalModal}: SupportalActionRestrictedModalProps) {
    const {translate} = useLocalize();
    return (
        <ConfirmModal
            title={translate('supportalNoAccess.title')}
            isVisible={isModalOpen}
            onConfirm={hideSupportalModal}
            prompt={translate('supportalNoAccess.description')}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
        />
    );
}

SupportalActionRestrictedModal.displayName = 'SupportalActionRestrictedModal';

export default SupportalActionRestrictedModal;
