import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
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
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectToXeroButtonProps} from './types';

function ConnectToXeroButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToXeroButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const {isOffline} = useNetwork();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const is2FAEnabled = account?.requiresTwoFactorAuth;

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (!is2FAEnabled) {
                        setIsRequire2FAModalOpen(true);
                        return;
                    }

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
                    title={translate('workspace.accounting.disconnectTitle', CONST.POLICY.CONNECTIONS.NAME.QBO)}
                    isVisible
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        Link.openLink(getXeroSetupLink(policyID), environmentURL);
                        setIsDisconnectModalOpen(false);
                    }}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', CONST.POLICY.CONNECTIONS.NAME.XERO)}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
            {isRequire2FAModalOpen && (
                <ConfirmModal
                    onConfirm={() => setIsRequire2FAModalOpen(false)}
                    isVisible
                    shouldShowCancelButton={false}
                />
            )}
        </>
    );
}

export default ConnectToXeroButton;
