import React, {useState} from 'react';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
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
    const currentIntegration = translate('workspace.accounting.integrationName', integrationToDisconnect);
    const integrationToConnect = translate('workspace.accounting.integrationName', CONST.POLICY.CONNECTIONS.NAME.XERO);

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
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle', currentIntegration)}
                    isVisible
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        Link.openLink(getXeroSetupLink(policyID), environmentURL);
                        setIsDisconnectModalOpen(false);
                    }}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', currentIntegration, integrationToConnect)}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
        </>
    );
}

export default ConnectToXeroButton;
