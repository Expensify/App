import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {ConnectionName} from '@src/types/onyx/Policy';
import ConfirmModal from './ConfirmModal';

type AccountingConnectionConfirmationModalProps = {
    integrationToConnect: ConnectionName;
    onConfirm: () => void;
    onCancel: () => void;
};

function AccountingConnectionConfirmationModal({integrationToConnect, onCancel, onConfirm}: AccountingConnectionConfirmationModalProps) {
    const {translate} = useLocalize();

    return (
        <ConfirmModal
            title={translate('workspace.accounting.connectTitle', integrationToConnect)}
            isVisible
            onConfirm={onConfirm}
            onCancel={onCancel}
            prompt={translate('workspace.accounting.connectPrompt', integrationToConnect)}
            confirmText={translate('workspace.accounting.setup')}
            cancelText={translate('common.cancel')}
            success
        />
    );
}

AccountingConnectionConfirmationModal.displayName = 'AccountingConnectionConfirmationModal';
export default AccountingConnectionConfirmationModal;
