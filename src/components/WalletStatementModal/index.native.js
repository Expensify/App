import React from 'react';
import {WebView} from 'react-native-webview';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import withLocalize from '../withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import {walletStatementPropTypes, walletStatementDefaultProps} from './WalletStatementModalPropTypes';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';

class WalletStatementModal extends React.Component {
    constructor(props) {
        super(props);

        this.authToken = lodashGet(props, 'session.authToken', null);
    }

    render() {
        return (
            <WebView
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
            />
        );
    }
};

WalletStatementModal.propTypes = walletStatementPropTypes;
WalletStatementModal.defaultProps = walletStatementDefaultProps;
WalletStatementModal.displayName = 'WalletStatementModal';
export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(WalletStatementModal);
