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
    /** Report the expense was created in */
    activeReportID?: string;

    /** The created transaction's ID */
    transactionID?: string;

    /** Whether the expense was started from the global create flow (FAB/no existing report) rather than from within a report */
    isFromGlobalCreate?: boolean;

    /** Whether the created item is an invoice rather than a regular expense */
    isInvoice?: boolean;

    /** Whether the destination report already contains transactions */
    hasMultipleTransactions: boolean;

    /** Whether to record the transaction ID in the report's pendingNewTransactionIDs metadata, used to highlight the newly-added row */
    shouldAddPendingNewTransactionIDs?: boolean;

    /** Whether to perform navigation, or only run the side effects */
    shouldNavigate?: boolean;

    /**
     * Whether the current user selected the "Looking around / Something else" (LOOKING_AROUND) onboarding choice.
     * The caller reads the onboarding choice from Onyx in render context (via `useOnyx`) and passes the result in,
     * so this helper stays a pure function instead of subscribing to Onyx itself.
     */
    isLookingAroundUser?: boolean;

    /**
     * Whether the sole destination for this expense is the current user's self-DM (Personal Space). The LOOKING_AROUND
     * "route to Spend > Expenses" behaviour is scoped to this so it only applies when the expense actually lands in the
     * self-DM. A LOOKING_AROUND user who later has a workspace and submits to a real report/friend keeps their normal
     * destination instead of being permanently sent to Search by mistake.
     */
    isSelfDMDestination?: boolean;
};

function getNavigateAfterCreateSearchNavigatorState() {
    const rootState = navigationRef.getRootState();
    const tabNavigatorRoute = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabNavigatorRoute?.state ?? (tabNavigatorRoute?.key ? getPreservedNavigatorState(tabNavigatorRoute.key) : undefined);
    const searchNavigatorRoute = tabState?.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    return searchNavigatorRoute?.state ?? (searchNavigatorRoute?.key ? getPreservedNavigatorState(searchNavigatorRoute.key) : undefined);
}

function getCurrentRouteBackTo() {
    const params = navigationRef.current?.getCurrentRoute()?.params;
    if (typeof params !== 'object' || params === null || !('backTo' in params) || typeof params.backTo !== 'string') {
        return undefined;
    }
    return params.backTo;
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
 * Opens a just-created expense when "View" is pressed on the "Expense added" growl. The user may have
 * switched tabs while the growl was up, so the destination follows wherever they are now.
 */
function navigateToCreatedExpense({threadReportID, transactionID, iouReportID}: NavigateToCreatedExpenseParams) {
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
        Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo}), {forceReplace});

        // A multi-transaction report opens super wide RHP, so stack the thread RHP on top of it. A single-transaction
        // report collapses to the thread itself, so the navigation above already landed on it.
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

    // A tracked expense has no expense report, so open the thread as a full report - the same way tapping
    // the expense in its self-DM chat does.
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
    isLookingAroundUser = false,
    isSelfDMDestination = false,
}: NavigateAfterExpenseCreateParams) {
    // Treat a LOOKING_AROUND user's self-DM create as "not on inbox" so it falls through to the Search navigation below
    // (route to Spend > Expenses instead of Personal Space). Scoped to isSelfDMDestination so other destinations are unaffected.
    const isUserOnInbox = isReportTopmostSplitNavigator() && !(isLookingAroundUser && isSelfDMDestination);

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
                // forceReplace keeps other callers on the tab they submitted from; skipped for the LOOKING_AROUND self-DM
                // flow so it actually navigates to Search.
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: !(isLookingAroundUser && isSelfDMDestination)});
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
