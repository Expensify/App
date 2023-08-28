import React, {useState} from 'react';
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
import * as Report from '../../libs/actions/Report';

function WalletStatementModal({statementPageURL, session}) {
    const [isLoading, setIsLoading] = useState(true);
    const authToken = lodashGet(session, 'authToken', null);

    /**
     * Handles in-app navigation for iframe links
     *
     * @param {MessageEvent} e
     */
    const navigate = (e) => {
        if (!e.data || !e.data.type || (e.data.type !== 'STATEMENT_NAVIGATE' && e.data.type !== 'CONCIERGE_NAVIGATE')) {
            return;
        }

        if (e.data.type === 'CONCIERGE_NAVIGATE') {
            Report.navigateToConciergeChat();
        }

        if (e.data.type === 'STATEMENT_NAVIGATE' && e.data.url) {
            const iouRoutes = [ROUTES.IOU_REQUEST, ROUTES.IOU_SEND, ROUTES.IOU_BILL];
            const navigateToIOURoute = _.find(iouRoutes, (iouRoute) => e.data.url.includes(iouRoute));
            if (navigateToIOURoute) {
                Navigation.navigate(navigateToIOURoute);
            }
        }
    };

    return (
        <>
            {isLoading && <FullScreenLoadingIndicator />}
            <View style={[styles.flex1]}>
                <iframe
                    src={`${statementPageURL}&authToken=${authToken}`}
                    title="Statements"
                    height="100%"
                    width="100%"
                    seamless="seamless"
                    frameBorder="0"
                    onLoad={() => {
                        setIsLoading(false);

                        // We listen to a message sent from the iframe to the parent component when a link is clicked.
                        // This lets us handle navigation in the app, outside of the iframe.
                        window.onmessage = (e) => navigate(e);
                    }}
                />
            </View>
        </>
    );
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
