import React from 'react';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type SuppportalActionNotAllowedModalProps = {
    isSupportalActionRestrictedModalOpen: boolean;
    hideSupportalModal: () => void;
};

function SuppportalActionNotAllowedModal({isSupportalActionRestrictedModalOpen, hideSupportalModal}: SuppportalActionNotAllowedModalProps) {
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

SuppportalActionNotAllowedModal.displayName = 'SuppportalActionNotAllowedModal';

export default SuppportalActionNotAllowedModal;
