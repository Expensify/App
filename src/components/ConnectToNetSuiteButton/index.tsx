import React, {useState} from 'react';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectToNetSuiteButtonProps} from './types';

function ConnectToNetSuiteButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToNetSuiteButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
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

                    // Will be updated to new token input page
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.getRoute(policyID));
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
                isDisabled={isOffline}
            />
            {shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect && (
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle', integrationToDisconnect)}
                    isVisible
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);

                        // Will be updated to new token input page
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.getRoute(policyID));
                        setIsDisconnectModalOpen(false);
                    }}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', CONST.POLICY.CONNECTIONS.NAME.NETSUITE, integrationToDisconnect)}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
        </>
    );
}

export default ConnectToNetSuiteButton;
