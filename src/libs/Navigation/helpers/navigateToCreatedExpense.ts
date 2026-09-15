import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';

import isReportOpenInRHP from './isReportOpenInRHP';
import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';
import setNavigationActionToMicrotaskQueue from './setNavigationActionToMicrotaskQueue';

type NavigateToCreatedExpenseParams = {
    /** The transaction thread report to open. */
    threadReportID: string;

    /** The created transaction's ID. */
    transactionID: string;

    /** IOU report the transaction landed in, used to decide whether to stack the expense report underneath. */
    iouReportID?: string;

    /** Transactions currently belonging to the IOU report. */
    reportTransactions: Transaction[];
};

function getCurrentRouteBackTo() {
    const params = navigationRef.current?.getCurrentRoute()?.params;
    if (typeof params !== 'object' || params === null || !('backTo' in params) || typeof params.backTo !== 'string') {
        return undefined;
    }
    return params.backTo;
}

/**
 * Opens a just-created expense when "View" is pressed on the "Expense added" growl. The user may have
 * switched tabs while the growl was up, so the destination follows wherever they are now.
 */
function navigateToCreatedExpense({threadReportID, transactionID, iouReportID, reportTransactions}: NavigateToCreatedExpenseParams) {
    // Don't reopen an expense the user is already looking at
    const hasMultipleReportTransactions = iouReportID
        ? reportTransactions.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length > 1
        : false;
    const focusedReportID = Navigation.getFocusedReportId();
    if (focusedReportID === threadReportID || (!hasMultipleReportTransactions && !!iouReportID && focusedReportID === iouReportID)) {
        return;
    }

    const openOnInbox = isReportTopmostSplitNavigator() && !isSearchTopmostFullScreenRoute();

    // When a report/expense is already open in the RHP the app's convention is to replace it rather than stack a second
    // report RHP on top of it.
    const forceReplace = isReportOpenInRHP(navigationRef.getRootState());
    const backTo = forceReplace ? getCurrentRouteBackTo() : Navigation.getActiveRoute();

    if (!openOnInbox) {
        setActiveTransactionIDs([transactionID]).then(() => {
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID, backTo}), {forceReplace});
        });
        return;
    }

    if (getIsNarrowLayout()) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(threadReportID, undefined, undefined, backTo), {forceReplace});
        return;
    }
    if (iouReportID) {
        Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo: forceReplace ? undefined : backTo}), {forceReplace});

        // A multi-transaction report opens super wide RHP, so stack the thread RHP on top of it. A single-transaction
        // report collapses to the thread itself, so the navigation above already landed on it.
        if (hasMultipleReportTransactions) {
            // Defer so the thread RHP stacks on top of the expense report navigation above. This is always a
            // push (never a replace) - it stacks on the report we just opened, not on the previously-open one.
            setNavigationActionToMicrotaskQueue(() => {
                setActiveTransactionIDs([transactionID]).then(() => {
                    Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID, backTo: Navigation.getActiveRoute()}));
                });
            });
        }
        return;
    }

    // A tracked expense has no expense report, so open the thread as a full report - the same way tapping
    // the expense in its self-DM chat does.
    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(threadReportID, undefined, undefined, backTo), {forceReplace});
}

export default navigateToCreatedExpense;
