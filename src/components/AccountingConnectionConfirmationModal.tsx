import React from 'react';
import {useActionsLocalize} from '@hooks/useLocalize';
import type {ConnectionName} from '@src/types/onyx/Policy';
import ConfirmModal from './ConfirmModal';

type AccountingConnectionConfirmationModalProps = {
    integrationToConnect: ConnectionName;
    onConfirm: () => void;
    onCancel: () => void;
};

function AccountingConnectionConfirmationModal({integrationToConnect, onCancel, onConfirm}: AccountingConnectionConfirmationModalProps) {
    const {translate} = useActionsLocalize();

    return (
        <ConfirmModal
            title={translate('workspace.accounting.connectTitle', {connectionName: integrationToConnect})}
            isVisible
            onConfirm={onConfirm}
            onCancel={onCancel}
            prompt={translate('workspace.accounting.connectPrompt', {connectionName: integrationToConnect})}
            confirmText={translate('workspace.accounting.setup')}
            cancelText={translate('common.cancel')}
            success
        />
    );
}

export default AccountingConnectionConfirmationModal;
