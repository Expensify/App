import React, {useEffect, useState} from 'react';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import useEnvironment from '@hooks/useEnvironment';
import {removePolicyConnection} from '@libs/actions/connections';
import getQuickBooksOnlineSetupLink from '@libs/actions/connections/QuickBooksOnline';
import * as Link from '@userActions/Link';
import * as PolicyAction from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {ConnectToQuickbooksOnlineButtonProps} from './types';

function ConnectToQuickbooksOnlineButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToQuickbooksOnlineButtonProps) {
    const {environmentURL} = useEnvironment();

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    useEffect(() => {
        if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
            setIsDisconnectModalOpen(true);
            return;
        }
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        PolicyAction.enablePolicyTaxes(policyID, false);
        Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect && isDisconnectModalOpen) {
        return (
            <AccountingConnectionConfirmationModal
                onConfirm={() => {
                    // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
                    PolicyAction.enablePolicyTaxes(policyID, false);
                    removePolicyConnection(policyID, integrationToDisconnect);
                    Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL);
                    setIsDisconnectModalOpen(false);
                }}
                integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.QBO}
                onCancel={() => setIsDisconnectModalOpen(false)}
            />
        );
    }
}

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';

export default ConnectToQuickbooksOnlineButton;
