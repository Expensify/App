import React, {useCallback, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import type {WebViewNavigation} from 'react-native-webview';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getQuickBooksOnlineSetupLink from '@libs/actions/connections/getQuickBooksOnlineSetupLink';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectToQuickbooksOnlineButtonOnyxProps, ConnectToQuickbooksOnlineButtonProps} from './types';

type WebViewNavigationEvent = WebViewNavigation;

function ConnectToQuickbooksOnlineButton({policyID, session}: ConnectToQuickbooksOnlineButtonProps) {
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

    return (
        <>
            <Button
                onPress={() => setWebViewOpen(true)}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
            />
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
                            uri: getQuickBooksOnlineSetupLink(policyID),
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

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';

export default withOnyx<ConnectToQuickbooksOnlineButtonProps, ConnectToQuickbooksOnlineButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToQuickbooksOnlineButton);
