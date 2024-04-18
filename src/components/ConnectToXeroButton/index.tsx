import React, {useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getXeroSetupLink from '@libs/actions/connections/ConnectToXero';
import * as Link from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectToXeroButtonOnyxProps, ConnectToXeroButtonProps} from './types';

function ConnectToXeroButton({policyID, environmentURL, disconnectIntegrationBeforeConnecting, integrationToConnect}: ConnectToXeroButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (disconnectIntegrationBeforeConnecting && integrationToConnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }
                    Link.openLink(getXeroSetupLink(policyID), environmentURL);
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
            />
            {disconnectIntegrationBeforeConnecting && integrationToConnect && isDisconnectModalOpen && (
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle')}
                    isVisible
                    onConfirm={() => Link.openLink(getXeroSetupLink(policyID), environmentURL)}
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

export default withOnyx<ConnectToXeroButtonProps, ConnectToXeroButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToXeroButton);
