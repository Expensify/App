import React, {useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type DeleteWorkspaceErrorConfirmModalProps = {
    /** The error message to display in the modal */
    errorMessage?: string;

    /** Callback when the modal is completely hidden */
    onModalHide?: () => void;
};

function DeleteWorkspaceErrorConfirmModal({errorMessage, onModalHide}: DeleteWorkspaceErrorConfirmModalProps) {
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState<boolean>(true);

    const hideAnnualSubscriptionErrorModal = () => {
        setIsVisible(false);
    };

    return (
        <ConfirmModal
            title={translate('workspace.common.delete')}
            isVisible={isVisible}
            onConfirm={hideAnnualSubscriptionErrorModal}
            onCancel={hideAnnualSubscriptionErrorModal}
            onModalHide={onModalHide}
            confirmText={translate('common.buttonConfirm')}
            prompt={errorMessage}
            shouldShowCancelButton={false}
            success={false}
        />
    );
}

DeleteWorkspaceErrorConfirmModal.displayName = 'DeleteWorkspaceErrorConfirmModal';
export default DeleteWorkspaceErrorConfirmModal;
