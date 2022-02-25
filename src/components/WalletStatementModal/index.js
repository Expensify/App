import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {ActivityIndicator, View} from 'react-native';
import compose from '../../libs/compose';
import withLocalize from '../withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import {walletStatementPropTypes, walletStatementDefaultProps} from './WalletStatementModalPropTypes';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

class WalletStatementModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
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
                            style={[styles.walletStatementModalLoadingIndicator]}
                        />
                    </View>
                )}
                <View style={[styles.flex1]}>
                    <iframe
                        src={`${this.props.statementPageURL}&authToken=${authToken}`}
                        title="Statements"
                        height="100%"
                        width="100%"
                        seamless="seamless"
                        frameBorder="0"
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
