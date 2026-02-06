import React, {useCallback, useRef} from 'react';
import type {WebViewMessageEvent, WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import type {ValueOf} from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WalletStatementProps} from './types';
import handleWalletStatementNavigation from './walletNavigationUtils';

type WebViewMessageType = ValueOf<typeof CONST.WALLET.WEB_MESSAGE_TYPE>;

type WebViewNavigationEvent = WebViewNavigation & {type?: WebViewMessageType};

const renderLoading = () => <FullScreenLoadingIndicator />;

function WalletStatementModal({statementPageURL}: WalletStatementProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const webViewRef = useRef<WebView>(null);
    const authToken = session?.authToken ?? null;

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const onMessage = useCallback(
        (event: WebViewMessageEvent) => {
            try {
                const parsedData = JSON.parse(event.nativeEvent.data) as WebViewNavigationEvent;
                const {type, url} = parsedData || {};
                if (!webViewRef.current) {
                    return;
                }

                handleWalletStatementNavigation(conciergeReportID, type, url);
            } catch (error) {
                console.error('Error parsing message from WebView:', error);
            }
        },
        [conciergeReportID],
    );

    return (
        <WebView
            ref={webViewRef}
            originWhitelist={['https://*']}
            source={{
                uri: statementPageURL,
                headers: {
                    Cookie: `authToken=${authToken}`,
                },
            }}
            incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
            startInLoadingState
            renderLoading={renderLoading}
            onMessage={onMessage}
        />
    );
}

export default WalletStatementModal;
