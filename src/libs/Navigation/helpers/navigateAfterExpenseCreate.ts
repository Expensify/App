/* eslint-disable no-console -- temporary debug instrumentation for [growl-view] POC */
import Onyx from 'react-native-onyx';
import {addPendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';
import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
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
    shouldAddPendingNewTransactionIDs?: boolean;
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
    shouldAddPendingNewTransactionIDs = false,
}: NavigateAfterExpenseCreateParams) {
    const isUserOnInbox = isReportTopmostSplitNavigator();
    const isUserOnSpend = isSearchTopmostFullScreenRoute();

    // If the expense is not created from global create or is currently on the inbox tab,
    // we just need to dismiss the money request flow screens
    // and open the report chat containing the IOU report
    if (!isFromGlobalCreate || isUserOnInbox || !transactionID) {
        dismissModalAndOpenReportInInboxTab(activeReportID, isInvoice, hasMultipleTransactions);
        if (shouldAddPendingNewTransactionIDs) {
            addPendingNewTransactionIDs(activeReportID, transactionID);
        }
        return;
    }

    const type = isInvoice ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;

    // POC variant B: navigate to Search (if not already there), then show the "View" growl on
    // Search once the optimistic IOU action lands in Onyx. Runs whether or not the user is
    // already on Spend — on the SEARCH_PRE_INSERT fast path the orchestrator pre-inserts Search
    // and dismisses the modal before createTransaction runs, so by the time we get here the user
    // is already on Search (isUserOnSpend=true). The growl must still fire in that case.
    //
    // Why this works without an explicit deferred-write flush: Search's content onLayout callback
    // calls flushDeferredWrite('search') as soon as the actual list (not the skeleton) renders.
    // That fires API.write, which applies optimistic data → our reportActions subscription fires
    // → we have a valid iouAction to build the thread from → show growl with working "View" link.
    const queryString = buildCannedSearchQuery({type});
    const rootState = navigationRef.getRootState();
    const searchNavigatorRoute = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastSearchRoute = searchNavigatorRoute?.state?.routes?.at(-1);
    const alreadyOnSearchRoot = isUserOnSpend && lastSearchRoute?.name === SCREENS.SEARCH.ROOT;
    const currentSearchQueryJSON = alreadyOnSearchRoot ? getCurrentSearchQueryJSON() : undefined;
    const isSameSearchType = currentSearchQueryJSON?.type === type;
    console.log('[growl-view] entering variant-B (navigate-to-Search-then-growl-when-ready)', {
        transactionID,
        iouReportID,
        providedTransactionThreadReportID,
        isInvoice,
        activeReportID,
        hasMultipleTransactions,
        queryString,
        isUserOnSpend,
        alreadyOnSearchRoot,
        isSameSearchType,
    });

    setPendingSubmitFollowUpAction(
        alreadyOnSearchRoot && isSameSearchType ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH,
    );

    const navigateToSearch = () => {
        const isNarrow = getIsNarrowLayout();
        const isFullscreenPreInserted = Navigation.getIsFullscreenPreInsertedUnderRHP();
        console.log('[growl-view] navigateToSearch firing', {
            isNarrow,
            fullscreenPreInserted: isFullscreenPreInserted,
            alreadyOnSearchRoot,
            isSameSearchType,
        });
        if (isNarrow && isFullscreenPreInserted) {
            Navigation.clearFullscreenPreInsertedFlag();
            Navigation.dismissModal();
            return;
        }
        if (isNarrow) {
            const isRHPStillOnTop = navigationRef.getRootState()?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
            if (!alreadyOnSearchRoot || !isSameSearchType || isRHPStillOnTop) {
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
            } else {
                console.log('[growl-view] navigateToSearch: already on matching Search root with RHP dismissed - no-op');
            }
            return;
        }
        if (alreadyOnSearchRoot && isSameSearchType) {
            console.log('[growl-view] navigateToSearch (wide): already on matching Search root - no-op');
            return;
        }
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: queryString}));
    };

    if (navigationRef.isReady()) {
        navigateToSearch();
    } else {
        Navigation.isNavigationReady().then(navigateToSearch);
    }

    const buildThreadFromOnyx = (logTag: string): string | undefined => {
        const iouReport = iouReportID ? getReportOrDraftReport(iouReportID) : undefined;
        const iouAction = iouReportID ? getIOUActionForReportID(iouReportID, transactionID) : undefined;
        let threadReportID = providedTransactionThreadReportID ?? iouAction?.childReportID;
        console.log(`[growl-view] ${logTag} – resolving thread`, {
            iouReportExists: !!iouReport,
            iouActionExists: !!iouAction,
            iouActionReportActionID: iouAction?.reportActionID,
            iouActionChildReportID: iouAction?.childReportID,
            initialThreadReportID: threadReportID,
        });
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
            console.log(`[growl-view] ${logTag} – createTransactionThreadReport result`, {
                optimisticThreadExists: !!optimisticThread,
                optimisticThreadReportID: optimisticThread?.reportID,
                optimisticThreadParentReportActionID: optimisticThread?.parentReportActionID,
            });
        } else {
            setOptimisticTransactionThread(threadReportID, iouReport?.reportID, iouAction?.reportActionID, iouReport?.policyID);
        }
        return threadReportID;
    };

    const showGrowl = (threadReportID: string | undefined, source: 'onyx' | 'timeout') => {
        console.log('[growl-view] triggering growl now', {threadReportID, source});
        if (!threadReportID) {
            Log.warn('[navigateAfterExpenseCreate] Unable to resolve transaction thread reportID; growl without View.');
            Growl.success('Expense added', CONST.GROWL.DURATION_LONG);
            return;
        }
        const resolvedThreadReportID = threadReportID;
        const navigateToExpenseRHP = () => {
            console.log('[growl-view] View clicked – pushing SEARCH_REPORT RHP', {
                resolvedThreadReportID,
                transactionID,
                currentActiveRoute: Navigation.getActiveRoute(),
            });
            const targetRoute = ROUTES.SEARCH_REPORT.getRoute({reportID: resolvedThreadReportID});
            setActiveTransactionIDs([transactionID]).then(() => {
                Navigation.navigate(targetRoute);
            });
        };
        // DEBUG: duration 0 → indefinite (no auto-dismiss) so we can inspect why "View" button isn't visible.
        Growl.success('Expense added', 0, {label: 'View', onPress: navigateToExpenseRHP});
    };

    // Fast path: iouAction already in Onyx (rare here since the FAB-from-outside-Spend path
    // typically defers the write, but covers retry / non-deferred edge cases).
    if (iouReportID && getIOUActionForReportID(iouReportID, transactionID)?.reportActionID) {
        console.log('[growl-view] fast path – iouAction already in Onyx');
        const threadReportID = buildThreadFromOnyx('fast-path');
        showGrowl(threadReportID, 'onyx');
        return;
    }

    // Slow path: wait for Search to render → flushDeferredWrite('search') → API.write applies
    // optimistic data → iouAction lands → we show the growl.
    const SAFETY_TIMEOUT_MS = 8000;
    let resolved = false;
    const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}` as const;
    console.log('[growl-view] slow path – subscribing to reportActions, waiting for Search to flush', {
        reportActionsKey,
        transactionID,
        safetyTimeoutMs: SAFETY_TIMEOUT_MS,
    });
    const connectionId = Onyx.connectWithoutView({
        key: reportActionsKey,
        callback: () => {
            if (resolved || !iouReportID) {
                return;
            }
            const iouAction = getIOUActionForReportID(iouReportID, transactionID);
            if (!iouAction?.reportActionID) {
                console.log('[growl-view] reportActions callback – iouAction not yet present');
                return;
            }
            resolved = true;
            Onyx.disconnect(connectionId);
            console.log('[growl-view] reportActions callback – iouAction landed in Onyx', {
                iouActionReportActionID: iouAction.reportActionID,
                iouActionChildReportID: iouAction.childReportID,
            });
            const threadReportID = buildThreadFromOnyx('onyx-landed');
            showGrowl(threadReportID, 'onyx');
        },
    });

    setTimeout(() => {
        if (resolved) {
            return;
        }
        resolved = true;
        Onyx.disconnect(connectionId);
        console.log('[growl-view] SAFETY TIMEOUT – iouAction never landed, falling back', {SAFETY_TIMEOUT_MS});
        const threadReportID = buildThreadFromOnyx('timeout');
        showGrowl(threadReportID, 'timeout');
    }, SAFETY_TIMEOUT_MS);
}

export default navigateAfterExpenseCreate;
