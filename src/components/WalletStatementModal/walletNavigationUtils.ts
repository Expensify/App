import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

/**
 * Handles navigation for wallet statement actions
 */
function handleWalletStatementNavigation(conciergeReportID: string | undefined, type?: string, url?: string): void {
    if (!type || (type !== CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && type !== CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE)) {
        return;
    }

    if (type === CONST.WALLET.WEB_MESSAGE_TYPE.CONCIERGE) {
        navigateToConciergeChat(conciergeReportID);
        return;
    }

    if (type === CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT && url) {
        const iouRoutes: Record<string, Route> = {
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
}

export default handleWalletStatementNavigation;
