import lodashGet from 'lodash/get';
import React, {useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import withLocalize from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {walletStatementDefaultProps, walletStatementPropTypes} from './WalletStatementModalPropTypes';

function WalletStatementModal({statementPageURL, session}) {
    const styles = useThemeStyles();
    const [isLoading, setIsLoading] = useState(true);
    const authToken = lodashGet(session, 'authToken', null);

    /**
     * Handles in-app navigation for iframe links
     *
     * @param {MessageEvent} event
     */
    const navigate = (event) => {
        if (!event.data || !event.data.type || (event.data.type !== CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && event.data.type !== CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE)) {
            return;
        }

        if (event.data.type === CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
            Report.navigateToConciergeChat();
        }

        if (event.data.type === CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && event.data.url) {
            const iouRoutes = [ROUTES.IOU_REQUEST, ROUTES.IOU_SEND];
            const navigateToIOURoute = _.find(iouRoutes, (iouRoute) => event.data.url.includes(iouRoute));
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
                        window.onmessage = navigate;
                    }}
                />
            </View>
        </>
    );
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
