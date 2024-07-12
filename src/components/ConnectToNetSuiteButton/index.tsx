import React, {useEffect, useState} from 'react';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectToNetSuiteButtonProps} from './types';

function ConnectToNetSuiteButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToNetSuiteButtonProps) {
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    useEffect(() => {
        if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
            setIsDisconnectModalOpen(true);
            return;
        }

        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect) {
        return (
            <AccountingConnectionConfirmationModal
                onConfirm={() => {
                    removePolicyConnection(policyID, integrationToDisconnect);

                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
                    setIsDisconnectModalOpen(false);
                }}
                integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
                onCancel={() => setIsDisconnectModalOpen(false)}
            />
        );
    }
}

export default ConnectToNetSuiteButton;
