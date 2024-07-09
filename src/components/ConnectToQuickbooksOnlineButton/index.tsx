import React, {useState} from 'react';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import Button from '@components/Button';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection} from '@libs/actions/connections';
import getQuickBooksOnlineSetupLink from '@libs/actions/connections/QuickBooksOnline';
import * as Link from '@userActions/Link';
import * as PolicyAction from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {ConnectToQuickbooksOnlineButtonProps} from './types';

function ConnectToQuickbooksOnlineButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToQuickbooksOnlineButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {isOffline} = useNetwork();

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }
                    // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
                    PolicyAction.enablePolicyTaxes(policyID, false);
                    Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL);
                }}
                isDisabled={isOffline}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
            />
            {shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect && isDisconnectModalOpen && (
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
            )}
        </>
    );
}

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';

export default ConnectToQuickbooksOnlineButton;
