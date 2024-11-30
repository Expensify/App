import React from 'react';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type SupportalActionModalProps = {
    isSupportalActionRestrictedModalOpen: boolean;
    hideSupportalModal: () => void;
};

function SupportalActionModal({isSupportalActionRestrictedModalOpen, hideSupportalModal}: SupportalActionModalProps) {
    const {translate} = useLocalize();
    return (
        <ConfirmModal
            title={translate('supportalNoAccess.title')}
            isVisible={isSupportalActionRestrictedModalOpen}
            onConfirm={hideSupportalModal}
            prompt={translate('supportalNoAccess.description')}
            confirmText={translate('common.buttonConfirm')}
            shouldShowCancelButton={false}
        />
    );
}

SupportalActionModal.displayName = 'SupportalActionModal';

export default SupportalActionModal;
