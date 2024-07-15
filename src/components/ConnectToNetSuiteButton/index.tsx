import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectToNetSuiteButtonProps} from './types';

function ConnectToNetSuiteButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToNetSuiteButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (!isControlPolicy(policy)) {
                        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.netSuite.alias));
                        return;
                    }

                    if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }

                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
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

                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
                        setIsDisconnectModalOpen(false);
                    }}
                    integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                />
            )}
        </>
    );
}

export default ConnectToNetSuiteButton;
