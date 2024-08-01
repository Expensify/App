import React, {useCallback, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import type {ValueOf} from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {WalletStatementOnyxProps, WalletStatementProps} from './types';

type WebViewMessageType = ValueOf<typeof CONST.WALLET.WEB_MESSAGE_TYPE>;

type WebViewNavigationEvent = WebViewNavigation & {type?: WebViewMessageType};

const IOU_ROUTES = [ROUTES.IOU_REQUEST, ROUTES.IOU_SEND];
const renderLoading = () => <FullScreenLoadingIndicator />;

function WalletStatementModal({statementPageURL, session}: WalletStatementProps) {
    const webViewRef = useRef<WebView>(null);
    const authToken = session?.authToken ?? null;

    /**
     * Handles in-app navigation for webview links
     */
    const handleNavigationStateChange = useCallback(
        ({type, url}: WebViewNavigationEvent) => {
            if (!webViewRef.current || (type !== CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && type !== CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE)) {
                return;
            }

            if (type === CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
                webViewRef.current.stopLoading();
                Report.navigateToConciergeChat(true);
            }

            if (type === CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && url) {
                const iouRoute = IOU_ROUTES.find((item) => url.includes(item));

                if (iouRoute) {
                    webViewRef.current.stopLoading();
                    Navigation.navigate(iouRoute);
                }
            }
        },
        [webViewRef],
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
            onNavigationStateChange={handleNavigationStateChange}
        />
    );
}

WalletStatementModal.displayName = 'WalletStatementModal';

export default withOnyx<WalletStatementProps, WalletStatementOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(WalletStatementModal);
