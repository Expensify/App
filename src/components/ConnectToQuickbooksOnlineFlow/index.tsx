import React, {useEffect, useState} from 'react';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import useEnvironment from '@hooks/useEnvironment';
import {removePolicyConnection} from '@libs/actions/connections';
import getQuickBooksOnlineSetupLink from '@libs/actions/connections/QuickBooksOnline';
import {useAccountingContext} from '@pages/workspace/accounting/AccountingContext';
import * as Link from '@userActions/Link';
import * as PolicyAction from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {ConnectToQuickbooksOnlineFlowProps} from './types';

function ConnectToQuickbooksOnlineFlow({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect, isActive}: ConnectToQuickbooksOnlineFlowProps) {
    const {environmentURL} = useEnvironment();

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const {startIntegrationFlow} = useAccountingContext();

    useEffect(() => {
        if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
            setIsDisconnectModalOpen(true);
            return;
        }

        if (!isActive) {
            return;
        }

        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        PolicyAction.enablePolicyTaxes(policyID, false);
        Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL);

        startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.QBO, isActive: false});
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

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

ConnectToQuickbooksOnlineFlow.displayName = 'ConnectToQuickbooksOnlineFlow';

export default ConnectToQuickbooksOnlineFlow;
