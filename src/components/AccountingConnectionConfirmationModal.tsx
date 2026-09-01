import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';

import React from 'react';

import ConfirmModal from './ConfirmModal';

type AccountingConnectionConfirmationModalProps = {
    integrationToConnect: ConnectionName;
    integrationDisplayName?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

function AccountingConnectionConfirmationModal({integrationToConnect, integrationDisplayName, onCancel, onConfirm}: AccountingConnectionConfirmationModalProps) {
    const {translate} = useLocalize();
    const connectionName = integrationDisplayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[integrationToConnect] ?? integrationToConnect;

    return (
        <ConfirmModal
            title={translate('workspace.accounting.connectTitle', connectionName)}
            isVisible
            onConfirm={onConfirm}
            onCancel={onCancel}
            prompt={translate('workspace.accounting.connectPrompt', connectionName)}
            confirmText={translate('workspace.accounting.setup')}
            cancelText={translate('common.cancel')}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AccountingConnectionConfirmationModal;
