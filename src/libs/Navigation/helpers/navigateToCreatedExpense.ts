import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {getCreated} from '@libs/TransactionUtils';

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

// Created dates are ISO strings, so comparing them as strings orders them chronologically
function compareByCreated(a: Transaction, b: Transaction) {
    const createdA = getCreated(a);
    const createdB = getCreated(b);
    if (createdA === createdB) {
        return 0;
    }
    return createdA < createdB ? -1 : 1;
}

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
    // Oldest first, the report's default order, so the prev/next arrows step through expenses as the report lists them
    const openableTransactionIDs = reportTransactions
        .filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .sort(compareByCreated)
        .map((transaction) => transaction.transactionID);
    const hasMultipleReportTransactions = iouReportID ? openableTransactionIDs.length > 1 : false;

    // Don't reopen an expense the user is already looking at. getState() can miss a just-opened RHP's nested state,
    // so read the full tree.
    const focusedReportID = Navigation.getFocusedReportId(navigationRef.getRootState());
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

    // Same as opening the expense from its report preview: the thread goes in the RHP on top of its report, so the
    // prev/next arrows show.
    if (getIsNarrowLayout() && iouReportID && hasMultipleReportTransactions) {
        // The expense report is already open full screen, with or without an RHP above it, so the thread goes on top of it.
        if ((!forceReplace && focusedReportID === iouReportID) || (forceReplace && Navigation.getTopmostReportId() === iouReportID)) {
            setActiveTransactionIDs(openableTransactionIDs);
            const threadBackTo = backTo ?? ROUTES.REPORT_WITH_ID.getRoute(iouReportID);
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID, backTo: threadBackTo}), {forceReplace});
            return;
        }

        const openThreadOnExpenseReport = () => {
            // Expense reports replace each other rather than stack, so another one open full screen is swapped out
            const openReportID = Navigation.getTopmostReportId(navigationRef.getRootState());
            const shouldReplaceOpenReport = !!openReportID && isMoneyRequestReport(openReportID);
            const reportBackTo = shouldReplaceOpenReport ? getCurrentRouteBackTo() : Navigation.getActiveRoute();
            const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, reportBackTo);
            Navigation.navigate(reportRoute, {forceReplace: shouldReplaceOpenReport});
            setActiveTransactionIDs(openableTransactionIDs);
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID, backTo: reportRoute}));
        };

        // A full screen report would be pushed above the open RHP instead of replacing it, so close the RHP first.
        if (forceReplace) {
            Navigation.dismissModal({afterTransition: openThreadOnExpenseReport});
            return;
        }
        openThreadOnExpenseReport();
        return;
    }

    if (getIsNarrowLayout()) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(threadReportID, undefined, undefined, backTo), {forceReplace});
        return;
    }
    if (iouReportID) {
        // The replaced RHP's backTo can point at this same report, which turns into a not-here page once it's
        // deleted. Drop it so deleting falls back to the report's chat instead.
        Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo: forceReplace ? undefined : backTo}), {forceReplace});

        // A multi-transaction report opens super wide RHP, so stack the thread RHP on top of it. A single-transaction
        // report collapses to the thread itself, so the navigation above already landed on it.
        if (hasMultipleReportTransactions) {
            // Defer so the thread RHP stacks on top of the expense report navigation above. This is always a
            // push (never a replace) - it stacks on the report we just opened, not on the previously-open one.
            setNavigationActionToMicrotaskQueue(() => {
                // Seed every expense on the report, not just this one, so the thread shows the prev/next arrows.
                setActiveTransactionIDs(openableTransactionIDs).then(() => {
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
