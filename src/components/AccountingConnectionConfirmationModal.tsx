import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {ConnectionName} from '@src/types/onyx/Policy';
import ConfirmModal from './ConfirmModal';

type AccountingConnectionConfirmationModalProps = {
    integrationToConnect: ConnectionName;
    onConfirm: () => void;
    onCancel: () => void;
    isModalVisible: boolean;
};

function AccountingConnectionConfirmationModal({integrationToConnect, isModalVisible, onCancel, onConfirm}: AccountingConnectionConfirmationModalProps) {
    const {translate} = useLocalize();

    return (
        <ConfirmModal
            title={translate('workspace.accounting.connectOtherIntegrationTitle', integrationToConnect)}
            isVisible={isModalVisible}
            onConfirm={onConfirm}
            onCancel={onCancel}
            prompt={translate('workspace.accounting.connectOtherIntegrationPrompt', integrationToConnect)}
            confirmText={translate('workspace.accounting.disconnect')}
            cancelText={translate('common.cancel')}
            danger
        />
    );
}

AccountingConnectionConfirmationModal.displayName = 'AccountingConnectionConfirmationModal';
export default AccountingConnectionConfirmationModal;
