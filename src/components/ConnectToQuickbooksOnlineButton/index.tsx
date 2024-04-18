import React, {useState} from 'react';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getQuickBooksOnlineSetupLink} from '@libs/actions/connections/QuickBooksOnline';
import * as Link from '@userActions/Link';
import type {ConnectToQuickbooksOnlineButtonProps} from './types';

function ConnectToQuickbooksOnlineButton({policyID, disconnectIntegrationBeforeConnecting, integrationToConnect}: ConnectToQuickbooksOnlineButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (disconnectIntegrationBeforeConnecting && integrationToConnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }
                    Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL);
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
            />
            {disconnectIntegrationBeforeConnecting && integrationToConnect && (
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle')}
                    isVisible={isDisconnectModalOpen}
                    onConfirm={() => Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL)}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', integrationToConnect)}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
        </>
    );
}

export default ConnectToQuickbooksOnlineButton;
