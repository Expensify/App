import React, {useState} from 'react';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import Button from '@components/Button';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection} from '@libs/actions/connections';
import {getXeroSetupLink} from '@libs/actions/connections/ConnectToXero';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type {ConnectToXeroButtonProps} from './types';

function ConnectToXeroButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToXeroButtonProps) {
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
                    Link.openLink(getXeroSetupLink(policyID), environmentURL);
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
                isDisabled={isOffline}
            />
            {shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect && (
                <AccountingConnectionConfirmationModal
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        Link.openLink(getXeroSetupLink(policyID), environmentURL);
                        setIsDisconnectModalOpen(false);
                    }}
                    integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.XERO}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                />
            )}
        </>
    );
}

export default ConnectToXeroButton;
