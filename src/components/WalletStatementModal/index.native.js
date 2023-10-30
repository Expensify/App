import lodashGet from 'lodash/get';
import React, {useCallback, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {walletStatementDefaultProps, walletStatementPropTypes} from './WalletStatementModalPropTypes';

const IOU_ROUTES = [ROUTES.IOU_REQUEST, ROUTES.IOU_SEND];
const renderLoading = () => <FullScreenLoadingIndicator />;

function WalletStatementModal({statementPageURL, session}) {
    const webViewRef = useRef();
    const authToken = lodashGet(session, 'authToken', null);

    /**
     * Handles in-app navigation for webview links
     *
     * @param {String} params.type
     * @param {String} params.url
     */
    const handleNavigationStateChange = useCallback(
        ({type, url}) => {
            if (!webViewRef.current || (type !== CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && type !== CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE)) {
                return;
            }

            if (type === CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
                webViewRef.current.stopLoading();
                Report.navigateToConciergeChat();
            }

            if (type === CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && url) {
                const iouRoute = _.find(IOU_ROUTES, (item) => url.includes(item));

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
WalletStatementModal.propTypes = walletStatementPropTypes;
WalletStatementModal.defaultProps = walletStatementDefaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(WalletStatementModal);
