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

class WalletStatementModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
        };
    }

    render() {
        const authToken = lodashGet(this.props, 'session.authToken', null);
        return (
            <>
                {this.state.isLoading && (
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <ActivityIndicator
                            color={themeColors.spinner}
                            size="large"
                        />
                    </View>
                )}
                <View style={[styles.flex1]}>
                    <WebView
                        originWhitelist={['https://*']}
                        source={{
                            uri: this.props.statementPageURL,
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                        onLoad={() => this.setState({isLoading: false})}
                    />
                </View>
            </>
        );
    }
}

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
