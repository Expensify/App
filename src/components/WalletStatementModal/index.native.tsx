import React, {useCallback, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {WebViewMessageEvent, WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import type {ValueOf} from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {WalletStatementProps} from './types';

type WebViewMessageType = ValueOf<typeof CONST.WALLET.WEB_MESSAGE_TYPE>;

type WebViewNavigationEvent = WebViewNavigation & {type?: WebViewMessageType};

const renderLoading = () => <FullScreenLoadingIndicator />;

function WalletStatementModal({statementPageURL}: WalletStatementProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const webViewRef = useRef<WebView>(null);
    const authToken = session?.authToken ?? null;

    const onMessage = useCallback((event: WebViewMessageEvent) => {
        try {
            const parsedData = JSON.parse(event.nativeEvent.data) as WebViewNavigationEvent;
            const {type, url} = parsedData || {};
            if (!webViewRef.current || !type || (type !== CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && type !== CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE)) {
                return;
            }

            if (type === CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
                webViewRef.current.stopLoading();
                navigateToConciergeChat();
            }

            if (type === CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && url) {
                const iouRoutes: Record<string, Route> = {
                    [CONST.WALLET.STATEMENT_ACTIONS.SUBMIT_EXPENSE]: ROUTES.MONEY_REQUEST_CREATE.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        CONST.IOU.TYPE.SUBMIT,
                        CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                        generateReportID(),
                    ),
                    [CONST.WALLET.STATEMENT_ACTIONS.PAY_SOMEONE]: ROUTES.MONEY_REQUEST_CREATE.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        CONST.IOU.TYPE.PAY,
                        CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                        String(CONST.DEFAULT_NUMBER_ID),
                    ),
                    [CONST.WALLET.STATEMENT_ACTIONS.SPLIT_EXPENSE]: ROUTES.MONEY_REQUEST_CREATE.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        CONST.IOU.TYPE.SPLIT,
                        CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                        generateReportID(),
                    ),
                };

                const navigateToIOURoute = Object.keys(iouRoutes).find((iouRoute) => url.includes(iouRoute));
                if (navigateToIOURoute && iouRoutes[navigateToIOURoute]) {
                    webViewRef.current?.stopLoading();
                    Navigation.navigate(iouRoutes[navigateToIOURoute]);
                }
            }
        } catch (error) {
            console.error('Error parsing message from WebView:', error);
        }
    }, []);

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

WalletStatementModal.displayName = 'WalletStatementModal';

export default WalletStatementModal;
