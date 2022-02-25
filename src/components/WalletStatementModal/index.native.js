import React from 'react';
import {WebView} from 'react-native-webview';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import {ActivityIndicator, View} from 'react-native';
import withLocalize from '../withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import {walletStatementPropTypes, walletStatementDefaultProps} from './WalletStatementModalPropTypes';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

const WalletStatementModal = (props) => {
    const authToken = lodashGet(props, 'session.authToken', null);
    return (
        <WebView
            originWhitelist={['https://*']}
            source={{
                uri: props.statementPageURL,
                headers: {
                    Cookie: `authToken=${authToken}`,
                },
            }}
            incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
            startInLoadingState={true}
            renderLoading={() => (
                <ActivityIndicator
                    color={themeColors.spinner}
                    size="large"
                    style={[styles.walletStatementModalLoadingIndicatorNative]}
                />
            )}
        />
    );
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
