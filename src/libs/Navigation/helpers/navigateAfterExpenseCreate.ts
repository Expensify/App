import Onyx from 'react-native-onyx';
import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Growl from '@libs/Growl';
import Log from '@libs/Log';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Beta, IntroSelected, Transaction} from '@src/types/onyx';
import dismissModalAndOpenReportInInboxTab from './dismissModalAndOpenReportInInboxTab';
import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

let currentUserEmail = '';
let currentUserAccountID: number = CONST.DEFAULT_NUMBER_ID;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserEmail = value?.email ?? '';
        currentUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

let introSelected: IntroSelected | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    callback: (value) => {
        introSelected = value ?? undefined;
    },
});

let betas: Beta[] | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (value) => {
        betas = value ?? undefined;
    },
});

const allTransactions: Record<string, Transaction> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (transactions) => {
        if (!transactions) {
            return;
        }
        for (const [key, value] of Object.entries(transactions)) {
            if (!value) {
                delete allTransactions[key];
            } else {
                allTransactions[key] = value;
            }
        }
    },
});

type NavigateAfterExpenseCreateParams = {
    activeReportID?: string;
    iouReportID?: string;
    transactionID?: string;
    transactionThreadReportID?: string;
    isFromGlobalCreate?: boolean;
    isInvoice?: boolean;
    hasMultipleTransactions: boolean;
};

/**
 * Helper to navigate after an expense is created in order to standardize the post‑creation experience
 * when creating an expense from the global create button.
 * If the expense is created from the global create button then:
 * - If it is created on the inbox tab, it will open the chat report containing that expense.
 * - If it is created elsewhere, it will navigate to Reports > Expense and highlight the newly created expense.
 */
function navigateAfterExpenseCreate({
    activeReportID,
    iouReportID,
    transactionID,
    transactionThreadReportID: providedTransactionThreadReportID,
    isFromGlobalCreate,
    isInvoice,
    hasMultipleTransactions,
}: NavigateAfterExpenseCreateParams) {
    const isUserOnInbox = isReportTopmostSplitNavigator();
    const isUserOnSpend = isSearchTopmostFullScreenRoute();

    // If the expense is not created from global create or is currently on the inbox tab,
    // we just need to dismiss the money request flow screens
    // and open the report chat containing the IOU report
    if (!isFromGlobalCreate || isUserOnInbox || !transactionID) {
        dismissModalAndOpenReportInInboxTab(activeReportID, isInvoice, hasMultipleTransactions);
        return;
    }

    const type = isInvoice ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;

    // POC: When the expense is created from outside Inbox AND outside Spend (e.g. from Settings),
    // show a growl with a "View" action instead of force-navigating away from the user's current screen.
    // Clicking View takes the user to Spend and opens the RHP focused on this expense.
    if (!isUserOnSpend) {
        const queryStringForGrowl = buildCannedSearchQuery({type});
        Navigation.dismissModal();
        Growl.success('Expense added', 6000, {
            label: 'View',
            onPress: () => {
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryStringForGrowl}), {forceReplace: true});

                const iouReport = iouReportID ? getReportOrDraftReport(iouReportID) : undefined;
                const iouAction = iouReportID ? getIOUActionForReportID(iouReportID, transactionID) : undefined;
                let threadReportID = providedTransactionThreadReportID ?? iouAction?.childReportID;

                // Mirrors MoneyRequestReportTransactionList.navigateToTransaction: if the IOU action has no
                // childReportID yet (shouldGenerateTransactionThreadReport=false in useExpenseSubmission),
                // build an optimistic transaction thread on the fly so we can deep-link to a single expense.
                if (!threadReportID) {
                    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                    const optimisticThread = createTransactionThreadReport({
                        introSelected,
                        currentUserLogin: currentUserEmail,
                        currentUserAccountID,
                        betas,
                        iouReport,
                        iouReportAction: iouAction,
                        transaction,
                    });
                    threadReportID = optimisticThread?.reportID;
                } else {
                    setOptimisticTransactionThread(threadReportID, iouReport?.reportID, iouAction?.reportActionID, iouReport?.policyID);
                }

                if (threadReportID) {
                    Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID}));
                } else if (activeReportID) {
                    Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: activeReportID}));
                }
            },
        });
        return;
    }

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
