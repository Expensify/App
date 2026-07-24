import {addPendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
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
    isFromNativeShortcut?: boolean;
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

/**
 * Standardizes post-creation navigation for expenses created from the global create button:
 * from the inbox tab it opens the chat report containing the expense; elsewhere it navigates to
 * Spend > Expenses. Exception: native home-screen shortcuts always go to Spend > Expenses.
 */
function navigateAfterExpenseCreate({
    activeReportID,
    transactionID,
    isFromGlobalCreate,
    isFromNativeShortcut,
    isInvoice,
    hasMultipleTransactions,
    shouldAddPendingNewTransactionIDs = false,
    shouldNavigate = true,
}: NavigateAfterExpenseCreateParams) {
    const isUserOnInbox = isReportTopmostSplitNavigator();

    // Land on Spend > Expenses only for global create outside the inbox tab, or for any native shortcut;
    // every other case dismisses to the report chat.
    const shouldLandOnSpendExpenses = isFromGlobalCreate && !!transactionID && (!isUserOnInbox || isFromNativeShortcut);

    if (!shouldLandOnSpendExpenses) {
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
