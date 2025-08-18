import React from 'react';
import useLocalize from '@hooks/useLocalize';
import {setDeleteWorkspaceErrorModalData} from '@libs/actions/Policy/Policy';
import ConfirmModal from './ConfirmModal';

type DeleteWorkspaceErrorConfirmModalProps = {
    errorMessage?: string;
};

function DeleteWorkspaceErrorConfirmModal({errorMessage}: DeleteWorkspaceErrorConfirmModalProps) {
    const {translate} = useLocalize();

    const hideAnnualSubscriptionErrorModal = () => {
        setDeleteWorkspaceErrorModalData(null);
    };

    return (
        <ConfirmModal
            title={translate('workspace.common.delete')}
            isVisible
            onConfirm={hideAnnualSubscriptionErrorModal}
            onCancel={hideAnnualSubscriptionErrorModal}
            confirmText={translate('common.buttonConfirm')}
            prompt={errorMessage}
            shouldShowCancelButton={false}
            success={false}
        />
    );
}

DeleteWorkspaceErrorConfirmModal.displayName = 'DeleteWorkspaceErrorConfirmModal';
export default DeleteWorkspaceErrorConfirmModal;
