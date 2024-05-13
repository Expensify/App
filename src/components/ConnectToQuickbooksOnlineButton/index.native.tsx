import React, {useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection} from '@libs/actions/connections';
import {getQuickBooksOnlineSetupLink} from '@libs/actions/connections/QuickBooksOnline';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import type {ConnectToQuickbooksOnlineButtonProps} from './types';

type ConnectToQuickbooksOnlineButtonOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

const renderLoading = () => <FullScreenLoadingIndicator />;

function ConnectToQuickbooksOnlineButton({
    policyID,
    session,
    shouldDisconnectIntegrationBeforeConnecting,
    integrationToDisconnect,
}: ConnectToQuickbooksOnlineButtonProps & ConnectToQuickbooksOnlineButtonOnyxProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setWebViewOpen] = useState(false);

    const authToken = session?.authToken ?? null;

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }
                    setWebViewOpen(true);
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
            />
            {shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect && isDisconnectModalOpen && (
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle', CONST.POLICY.CONNECTIONS.NAME.XERO)}
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        setIsDisconnectModalOpen(false);
                        setWebViewOpen(true);
                    }}
                    isVisible
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', CONST.POLICY.CONNECTIONS.NAME.QBO)}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            )}
            {isWebViewOpen && (
                <Modal
                    onClose={() => setWebViewOpen(false)}
                    fullscreen
                    isVisible
                    type={CONST.MODAL.MODAL_TYPE.CENTERED}
                >
                    <HeaderWithBackButton
                        title={translate('workspace.accounting.title')}
                        onBackButtonPress={() => setWebViewOpen(false)}
                    />
                    <FullPageOfflineBlockingView>
                        <WebView
                            ref={webViewRef}
                            source={{
                                uri: getQuickBooksOnlineSetupLink(policyID),
                                headers: {
                                    Cookie: `authToken=${authToken}`,
                                },
                            }}
                            incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                            startInLoadingState
                            renderLoading={renderLoading}
                        />
                    </FullPageOfflineBlockingView>
                </Modal>
            )}
        </>
    );
}

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';

export default withOnyx<ConnectToQuickbooksOnlineButtonProps & ConnectToQuickbooksOnlineButtonOnyxProps, ConnectToQuickbooksOnlineButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToQuickbooksOnlineButton);
