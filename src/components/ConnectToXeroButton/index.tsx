import React, {useEffect, useState} from 'react';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import useEnvironment from '@hooks/useEnvironment';
import {removePolicyConnection} from '@libs/actions/connections';
import {getXeroSetupLink} from '@libs/actions/connections/ConnectToXero';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type {ConnectToXeroButtonProps} from './types';

function ConnectToXeroButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToXeroButtonProps) {
    const {environmentURL} = useEnvironment();

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    useEffect(() => {
        if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
            setIsDisconnectModalOpen(true);
            return;
        }
        Link.openLink(getXeroSetupLink(policyID), environmentURL);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect) {
        return (
            <AccountingConnectionConfirmationModal
                onConfirm={() => {
                    removePolicyConnection(policyID, integrationToDisconnect);
                    Link.openLink(getXeroSetupLink(policyID), environmentURL);
                    setIsDisconnectModalOpen(false);
                }}
                integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.XERO}
                onCancel={() => setIsDisconnectModalOpen(false)}
            />
        );
    }
}

export default ConnectToXeroButton;
