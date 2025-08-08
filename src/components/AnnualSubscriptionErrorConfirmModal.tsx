import React from 'react';
import useLocalize from '@hooks/useLocalize';
import {setIsDeleteWorkspaceAnnualSubscriptionErrorModalOpen} from '@libs/actions/Policy/Policy';
import ConfirmModal from './ConfirmModal';

function AnnualSubscriptionErrorConfirmModal() {
    const {translate} = useLocalize();

    const hideAnnualSubscriptionErrorModal = () => {
        setIsDeleteWorkspaceAnnualSubscriptionErrorModalOpen(false);
    };

    return (
        <ConfirmModal
            title={translate('workspace.common.delete')}
            isVisible
            onConfirm={hideAnnualSubscriptionErrorModal}
            onCancel={hideAnnualSubscriptionErrorModal}
            confirmText={translate('common.buttonConfirm')}
            prompt={translate('workspace.common.cannotDeleteWorkspaceAnnualSubscriptionError')}
            shouldShowCancelButton={false}
            success={false}
        />
    );
}

AnnualSubscriptionErrorConfirmModal.displayName = 'AnnualSubscriptionErrorConfirmModal';
export default AnnualSubscriptionErrorConfirmModal;
