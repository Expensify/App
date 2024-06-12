import React, {useState} from 'react';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection} from '@libs/actions/connections';
import {getXeroSetupLink} from '@libs/actions/connections/ConnectToXero';
import Navigation from '@libs/Navigation/Navigation';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';

type ConnectToSageIntacctButtonProps = {
    policyID: string;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: PolicyConnectionName;
};

function ConnectToXeroButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToSageIntacctButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const currentIntegration = translate('workspace.accounting.integrationName', integrationToDisconnect);
    const integrationToConnect = translate('workspace.accounting.integrationName', CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT);

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
                isDisabled={isOffline}
            />
            {shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect && (
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle', currentIntegration)}
                    isVisible
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        setIsDisconnectModalOpen(false);
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
                    }}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', integrationToConnect, currentIntegration)}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
        </>
    );
}

export default ConnectToXeroButton;
