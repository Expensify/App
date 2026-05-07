import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useRef} from 'react';
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

const renderLoading = () => <FullScreenLoadingIndicator reasonAttributes={{context: 'WalletStatementModal'}} />;

function WalletStatementModal({statementPageURL}: WalletStatementProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const webViewRef = useRef<WebView>(null);

    const authToken = session?.authToken ?? null;

    const onMessage = (event: WebViewMessageEvent) => {
        let parsedData: WebViewNavigationEvent | null = null;
        try {
            parsedData = JSON.parse(event.nativeEvent.data) as WebViewNavigationEvent;
        } catch (error) {
            console.error('Error parsing message from WebView:', error);
            return;
        }
        if (!webViewRef.current || !parsedData) {
            return;
        }
        handleWalletStatementNavigation(conciergeReportID, introSelected, session?.accountID, isSelfTourViewed, betas, parsedData.type, parsedData.url);
    };

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
