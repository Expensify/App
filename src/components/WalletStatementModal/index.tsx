import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {WalletStatementMessage, WalletStatementProps} from './types';

function WalletStatementModal({statementPageURL}: WalletStatementProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const styles = useThemeStyles();
    const [isLoading, setIsLoading] = useState(true);
    const authToken = session?.authToken ?? null;

    /**
     * Handles in-app navigation for iframe links
     */
    const navigate = (event: MessageEvent<WalletStatementMessage>) => {
        const {data} = event;
        const {type, url} = data || {};
        if (!type || (type !== CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && type !== CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE)) {
            return;
        }

        if (type === CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
            navigateToConciergeChat(true);
        }

        if (type === CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && url) {
            const iouRoutes: Record<string, Route> = {
                [ROUTES.IOU_REQUEST]: ROUTES.IOU_REQUEST,
                [ROUTES.IOU_SEND]: ROUTES.IOU_SEND,
                [CONST.WALLET.STATEMENT_ACTIONS.SUBMIT_EXPENSE]: ROUTES.MONEY_REQUEST_CREATE.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    CONST.IOU.TYPE.SUBMIT,
                    CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                    generateReportID(),
                ),
                [CONST.WALLET.STATEMENT_ACTIONS.PAY_SOMEONE]: ROUTES.MONEY_REQUEST_CREATE.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    CONST.IOU.TYPE.PAY,
                    CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                    String(CONST.DEFAULT_NUMBER_ID),
                ),
                [CONST.WALLET.STATEMENT_ACTIONS.SPLIT_EXPENSE]: ROUTES.MONEY_REQUEST_CREATE.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    CONST.IOU.TYPE.SPLIT,
                    CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                    generateReportID(),
                ),
            };
            const navigateToIOURoute = Object.keys(iouRoutes).find((iouRoute) => url.includes(iouRoute));
            if (navigateToIOURoute && iouRoutes[navigateToIOURoute]) {
                Navigation.navigate(iouRoutes[navigateToIOURoute]);
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

export default WalletStatementModal;
