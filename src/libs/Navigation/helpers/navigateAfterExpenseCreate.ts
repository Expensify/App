import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import dismissModalAndOpenReportInInboxTab from './dismissModalAndOpenReportInInboxTab';
import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

type NavigateAfterExpenseCreateParams = {
    activeReportID?: string;
    transactionID?: string;
    isFromGlobalCreate?: boolean;
    isInvoice?: boolean;
    hasMultipleTransactions: boolean;
};

/**
 * Navigates to the appropriate screen after an expense is created.
 * - If not from global create, on the inbox tab, or no transactionID: dismisses modal and opens the report.
 * - If from global create and not on inbox: navigates to Search (Expenses or Invoices).
 */
function navigateAfterExpenseCreate({activeReportID, transactionID, isFromGlobalCreate, isInvoice, hasMultipleTransactions}: NavigateAfterExpenseCreateParams) {
    const isUserOnInbox = isReportTopmostSplitNavigator();

    // If the expense is not created from global create or is currently on the inbox tab,
    // we just need to dismiss the money request flow screens
    // and open the report chat containing the IOU report
    if (!isFromGlobalCreate || isUserOnInbox || !transactionID) {
        dismissModalAndOpenReportInInboxTab(activeReportID, isInvoice, hasMultipleTransactions);
        return;
    }

    const type = isInvoice ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;

    // When already on Search ROOT with the same type (expense vs invoice), we navigate to the same screen (no-op or refresh); record as dismiss_modal_only.
    // When on another Search sub-tab (e.g. Chats), or on Search with a different type (e.g. on Invoice, submitting expense), record as navigate_to_search.
    const rootState = navigationRef.getRootState();
    const searchNavigatorRoute = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastSearchRoute = searchNavigatorRoute?.state?.routes?.at(-1);
    const alreadyOnSearchRoot = isSearchTopmostFullScreenRoute() && lastSearchRoute?.name === SCREENS.SEARCH.ROOT;
    const currentSearchQueryJSON = alreadyOnSearchRoot ? getCurrentSearchQueryJSON() : undefined;
    const isSameSearchType = currentSearchQueryJSON?.type === type;
    setPendingSubmitFollowUpAction(
        alreadyOnSearchRoot && isSameSearchType ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH,
    );

    const queryString = buildCannedSearchQuery({type});
    const navigateToSearch = () => {
        if (getIsNarrowLayout()) {
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
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
