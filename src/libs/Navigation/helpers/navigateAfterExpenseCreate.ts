import {addPendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getReportTransactions} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import dismissModalAndOpenReportInInboxTab from './dismissModalAndOpenReportInInboxTab';
import isReportOpenInRHP from './isReportOpenInRHP';
import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';
import setNavigationActionToMicrotaskQueue from './setNavigationActionToMicrotaskQueue';

type NavigateAfterExpenseCreateParams = {
    activeReportID?: string;
    transactionID?: string;
    isFromGlobalCreate?: boolean;
    isInvoice?: boolean;
    hasMultipleTransactions: boolean;
    shouldAddPendingNewTransactionIDs?: boolean;
    shouldNavigate?: boolean;
};

function getNavigateAfterCreateSearchNavigatorState() {
    const rootState = navigationRef.getRootState();
    const tabNavigatorRoute = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabNavigatorRoute?.state ?? (tabNavigatorRoute?.key ? getPreservedNavigatorState(tabNavigatorRoute.key) : undefined);
    const searchNavigatorRoute = tabState?.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    return searchNavigatorRoute?.state ?? (searchNavigatorRoute?.key ? getPreservedNavigatorState(searchNavigatorRoute.key) : undefined);
}

type NavigateToCreatedExpenseParams = {
    /** The transaction thread report to open. */
    threadReportID: string;

    /** The created transaction's ID. */
    transactionID: string;

    /** IOU report the transaction landed in, used to decide whether to stack the expense report underneath. */
    iouReportID?: string;
};

/**
 * Navigates to a just-created expense, choosing the destination from the surface the user
 * is currently looking at (they may have switched tabs while the growl was up)
 * - Spend tab: the transaction thread RHP within Spend (report shown underneath via the wide RHP)
 * - Inbox tab, narrow layout: the transaction thread as a full report view
 * - Inbox tab, wide layout, with an expense report: the expense report - a multi-transaction report opens super
 *   wide with the specific thread RHP stacked on top; a single-transaction report collapses to the thread itself
 * - Inbox tab, wide layout, tracked/unreported expense (no expense report): the transaction thread RHP directly
 */
function navigateToCreatedExpense({threadReportID, transactionID, iouReportID}: NavigateToCreatedExpenseParams) {
    const backTo = Navigation.getActiveRoute();
    const openOnInbox = isReportTopmostSplitNavigator() && !isSearchTopmostFullScreenRoute();

    // When a report/expense is already open in the RHP the app's convention is to replace it rather than stack a second
    // report RHP on top of it.
    const forceReplace = isReportOpenInRHP(navigationRef.getRootState());

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
        Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo}), {forceReplace});

        // A multi-transaction report opens super wide (see SearchMoneyRequestReportPage's `shouldShowSuperWideRHP`),
        // so stack the specific thread RHP on top of it. A single-transaction report collapses to the thread
        // itself, so the expense report navigation above already lands on it.
        const hasMultipleReportTransactions =
            getReportTransactions(iouReportID).filter((transaction) => transaction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length > 1;
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

    // Tracked/unreported expense (self-DM): there's no expense report, so open the transaction thread as a full
    // report - the same way tapping the expense in its self-DM chat does (see ChatTransactionPreview), rather
    // than the Search-tab RHP.
    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(threadReportID, undefined, undefined, backTo), {forceReplace});
}

/**
 * Helper to navigate after an expense is created in order to standardize the post‑creation experience
 * when creating an expense from the global create button.
 * If the expense is created from the global create button then:
 * - If it is created on the inbox tab, it will open the chat report containing that expense.
 * - If it is created elsewhere, it will navigate to Reports > Expense and show the "Expense added" growl.
 */
function navigateAfterExpenseCreate({
    activeReportID,
    transactionID,
    isFromGlobalCreate,
    isInvoice,
    hasMultipleTransactions,
    shouldAddPendingNewTransactionIDs = false,
    shouldNavigate = true,
}: NavigateAfterExpenseCreateParams) {
    const isUserOnInbox = isReportTopmostSplitNavigator();

    // If the expense is not created from global create or is currently on the inbox tab,
    // we just need to dismiss the money request flow screens
    // and open the report chat containing the IOU report
    if (!isFromGlobalCreate || isUserOnInbox || !transactionID) {
        if (shouldNavigate) {
            dismissModalAndOpenReportInInboxTab(activeReportID, isInvoice, hasMultipleTransactions);
        }
        if (shouldAddPendingNewTransactionIDs) {
            addPendingNewTransactionIDs(activeReportID, transactionID);
        }
        return;
    }

    if (!shouldNavigate) {
        return;
    }

    const type = isInvoice ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;

    // When already on Search ROOT with the same type (expense vs invoice), we navigate to the same screen (no-op or refresh); record as dismiss_modal_only.
    // When on another Search sub-tab (e.g. Chats), or on Search with a different type (e.g. on Invoice, submitting expense), record as navigate_to_search.
    const searchNavigatorState = getNavigateAfterCreateSearchNavigatorState();
    const lastSearchRoute = searchNavigatorState?.routes?.at(-1);
    const isSearchTopmost = isSearchTopmostFullScreenRoute();
    const alreadyOnSearchRoot = isSearchTopmost && lastSearchRoute?.name === SCREENS.SEARCH.ROOT;
    const currentSearchQueryJSON = alreadyOnSearchRoot ? getCurrentSearchQueryJSON() : undefined;
    const isSameSearchType = currentSearchQueryJSON?.type === type;
    const followUpAction = alreadyOnSearchRoot && isSameSearchType ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH;
    setPendingSubmitFollowUpAction(followUpAction);

    const queryString = buildCannedSearchQuery({type});
    const navigateToSearch = () => {
        // On the fast path, onConfirm already cleared the flag and dismissed the modal,
        // so this branch is only reached on the slow path (user submitted before the
        // 300ms pre-insert timer fired).
        if (getIsNarrowLayout() && Navigation.getIsFullscreenPreInsertedUnderRHP()) {
            Navigation.clearFullscreenPreInsertedFlag();
            Navigation.dismissModal();
        } else if (getIsNarrowLayout()) {
            const isRHPStillOnTop = navigationRef.getRootState()?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
            if (!alreadyOnSearchRoot || !isSameSearchType || isRHPStillOnTop) {
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
            } else {
                Log.info('[IOU] navigateToSearch: already on matching Search root with RHP dismissed - no-op');
            }
        } else {
            Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: queryString}));
        }
    };

    if (navigationRef.isReady()) {
        navigateToSearch();
    } else {
        Navigation.isNavigationReady().then(navigateToSearch);
    }
}

export default navigateAfterExpenseCreate;
export {navigateToCreatedExpense};
