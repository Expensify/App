import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import _ from 'underscore';
import compose from '../../libs/compose';
import withLocalize from '../withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import {walletStatementPropTypes, walletStatementDefaultProps} from './WalletStatementModalPropTypes';
import styles from '../../styles/styles';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

class WalletStatementModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
        };
    }

    /**
     * Handles in-app navigation for iframe links
     *
     * @param {String} url
     */
    navigate(url) {
        if (!url) {
            return;
        }
        const iouRoutes = [ROUTES.IOU_REQUEST, ROUTES.IOU_SEND, ROUTES.IOU_BILL];
        const navigateToIOURoute = _.find(iouRoutes, iouRoute => url.includes(iouRoute));
        if (navigateToIOURoute) {
            Navigation.navigate(navigateToIOURoute);
        }
    }

    render() {
        const authToken = lodashGet(this.props, 'session.authToken', null);
        return (
            <>
                <FullScreenLoadingIndicator
                    visible={this.state.isLoading}
                />
                <View style={[styles.flex1]}>
                    <iframe
                        src={`${this.props.statementPageURL}&authToken=${authToken}`}
                        title="Statements"
                        height="100%"
                        width="100%"
                        seamless="seamless"
                        frameBorder="0"
                        onLoad={() => {
                            this.setState({isLoading: false});

                            // We listen to a message sent from the iframe to the parent component when a link is clicked.
                            // This lets us handle navigation in the app, outside of the iframe.
                            window.onmessage = e => this.navigate(e.data);
                        }}
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
