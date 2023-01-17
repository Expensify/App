import React from 'react';
import {WebView} from 'react-native-webview';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import withLocalize from '../withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import {walletStatementPropTypes, walletStatementDefaultProps} from './WalletStatementModalPropTypes';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import * as Report from '../../libs/actions/Report';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

class WalletStatementModal extends React.Component {
    constructor(props) {
        super(props);

        this.authToken = lodashGet(props, 'session.authToken', null);
        this.navigate = this.navigate.bind(this);
    }

    /**
     * Handles in-app navigation for webview links
     *
     * @param {String} params.type
     * @param {String} params.url
     */
    navigate({type, url}) {
        if (!this.webview || (type !== 'STATEMENT_NAVIGATE' && type !== 'CONCIERGE_NAVIGATE')) {
            return;
        }

        if (type === 'CONCIERGE_NAVIGATE') {
            this.webview.stopLoading();
            Report.navigateToConciergeChat();
        }

        if (type === 'STATEMENT_NAVIGATE' && url) {
            const iouRoutes = [ROUTES.IOU_REQUEST, ROUTES.IOU_SEND, ROUTES.IOU_BILL];
            const navigateToIOURoute = _.find(iouRoutes, iouRoute => url.includes(iouRoute));
            if (navigateToIOURoute) {
                this.webview.stopLoading();
                Navigation.navigate(navigateToIOURoute);
            }
        }
    }

    render() {
        return (
            <WebView
                ref={node => this.webview = node}
                originWhitelist={['https://*']}
                source={{
                    uri: this.props.statementPageURL,
                    headers: {
                        Cookie: `authToken=${this.authToken}`,
                    },
                }}
                incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                startInLoadingState
                renderLoading={() => <FullScreenLoadingIndicator />}
                onNavigationStateChange={this.navigate}
            />
        );
    }
}

WalletStatementModal.propTypes = walletStatementPropTypes;
WalletStatementModal.defaultProps = walletStatementDefaultProps;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(WalletStatementModal);
