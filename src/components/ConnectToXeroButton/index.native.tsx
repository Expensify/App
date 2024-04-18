import React, {useCallback, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import type {WebViewNavigation} from 'react-native-webview';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getXeroSetupLink from '@libs/actions/connections/ConnectToXero';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectToXeroButtonOnyxProps, ConnectToXeroButtonProps} from './types';

type WebViewNavigationEvent = WebViewNavigation;

function ConnectToXeroButton({policyID, session, disconnectIntegrationBeforeConnecting, integrationToConnect}: ConnectToXeroButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setWebViewOpen] = useState<boolean>(false);

    const authToken = session?.authToken ?? null;

    const renderLoading = () => <FullScreenLoadingIndicator />;

    /**
     * Handles in-app navigation for webview links
     */
    const handleNavigationStateChange = useCallback(({url}: WebViewNavigationEvent) => !!url, []);

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => setWebViewOpen(true)}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
            />
            {disconnectIntegrationBeforeConnecting && integrationToConnect && isDisconnectModalOpen && (
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle')}
                    onConfirm={() => setWebViewOpen(true)}
                    isVisible
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', integrationToConnect)}
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
                    type="centered"
                >
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: getXeroSetupLink(policyID),
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        incognito
                        startInLoadingState
                        renderLoading={renderLoading}
                        onNavigationStateChange={handleNavigationStateChange}
                    />
                </Modal>
            )}
        </>
    );
}

ConnectToXeroButton.displayName = 'ConnectToXeroButton';

export default withOnyx<ConnectToXeroButtonProps, ConnectToXeroButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToXeroButton);
