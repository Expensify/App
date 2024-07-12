import React, {useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {WalletStatementMessage, WalletStatementOnyxProps, WalletStatementProps} from './types';

function WalletStatementModal({statementPageURL, session}: WalletStatementProps) {
    const styles = useThemeStyles();
    const [isLoading, setIsLoading] = useState(true);
    const authToken = session?.authToken ?? null;

    /**
     * Handles in-app navigation for iframe links
     */
    const navigate = (event: MessageEvent<WalletStatementMessage>) => {
        if (!event.data?.type || (event.data.type !== CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && event.data.type !== CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE)) {
            return;
        }

        if (event.data.type === CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
            Report.navigateToConciergeChat(true);
        }

        if (event.data.type === CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && event.data.url) {
            const iouRoutes = [ROUTES.IOU_REQUEST, ROUTES.IOU_SEND];
            const navigateToIOURoute = iouRoutes.find((iouRoute) => event.data.url.includes(iouRoute));
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
                    seamless
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

WalletStatementModal.displayName = 'WalletStatementModal';

export default withOnyx<WalletStatementProps, WalletStatementOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(WalletStatementModal);
