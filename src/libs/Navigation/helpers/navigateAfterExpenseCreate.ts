/* eslint-disable no-console -- temporary debug instrumentation for [growl-view] POC */
import Onyx from 'react-native-onyx';
import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {flushDeferredWrite, hasDeferredWrite} from '@libs/deferredLayoutWrite';
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
    // we want a growl with "View" deep-link. The thread can only be built once the optimistic IOU
    // action lands in Onyx (parentReportActionID must be valid so the BE registers the thread
    // correctly via openReport(newReportObject); otherwise ReportScreen 404s).
    //
    // Because the FAB path uses deferOrExecuteWrite (deferred-for-search), the optimistic data
    // isn't applied to the Onyx cache until later. Strategy: leave the modal open (so the RHP
    // submit button's spinner keeps spinning) and subscribe to the IOU report's reportActions.
    // As soon as the new IOU action appears, dismiss the modal, build the thread, and show the growl.
    if (!isUserOnSpend) {
        const queryStringForGrowl = buildCannedSearchQuery({type});
        console.log('[growl-view] entering growl branch (modal stays open, waiting for iouAction)', {
            transactionID,
            iouReportID,
            providedTransactionThreadReportID,
            isInvoice,
            activeReportID,
            hasMultipleTransactions,
            queryStringForGrowl,
            currentUserEmail,
            currentUserAccountID,
            introSelectedExists: !!introSelected,
            betasCount: betas?.length,
        });

        // The submission flow registers the API.write via deferOrExecuteWrite with shouldDeferForSearch=true
        // when isFromGlobalCreate. That defers optimistic-data application until the Search component lays out
        // (or the 5s safety timeout fires). We are NOT navigating to Search here — we are staying on the origin
        // route and showing a growl — so nothing will ever flush that channel and the user waits 5s for the
        // optimistic IOU action to land. Flush it now to apply optimistic data immediately.
        const hadSearchDeferral = hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        console.log('[growl-view] flushing deferred SEARCH write if any', {hadSearchDeferral});
        if (hadSearchDeferral) {
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        }

        const showGrowlAndDismiss = (threadReportID: string | undefined, source: 'onyx' | 'timeout') => {
            console.log('[growl-view] dismissing modal + showing growl', {threadReportID, source});
            Navigation.dismissModal();
            if (!threadReportID) {
                Log.warn('[navigateAfterExpenseCreate] Unable to resolve transaction thread reportID; growl without View.');
                Growl.success('Expense added', CONST.GROWL.DURATION_LONG);
                return;
            }
            const resolvedThreadReportID = threadReportID;
            const navigateToExpenseRHP = () => {
                console.log('[growl-view] View clicked – starting navigation', {
                    resolvedThreadReportID,
                    transactionID,
                    currentActiveRoute: Navigation.getActiveRoute(),
                });
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryStringForGrowl}), {forceReplace: true});
                const targetRoute = ROUTES.SEARCH_REPORT.getRoute({reportID: resolvedThreadReportID});
                setActiveTransactionIDs([transactionID]).then(() => {
                    setTimeout(() => {
                        console.log('[growl-view] navigating to RHP', {targetRoute, currentActiveRoute: Navigation.getActiveRoute()});
                        Navigation.navigate(targetRoute);
                    }, 350);
                });
            };
            Growl.success('Expense added', 6000, {label: 'View', onPress: navigateToExpenseRHP});
        };

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
                console.log(`[growl-view] ${logTag} – building optimistic thread`, {
                    transactionExists: !!transaction,
                    transactionPendingAction: transaction?.pendingAction,
                    iouActionPresent: !!iouAction,
                });
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

        // Fast path: maybe optimistic data already landed (e.g. non-deferred write, or providedTransactionThreadReportID).
        const existingThreadReportID = providedTransactionThreadReportID ?? (iouReportID ? getIOUActionForReportID(iouReportID, transactionID)?.childReportID : undefined);
        if (existingThreadReportID || (iouReportID && getIOUActionForReportID(iouReportID, transactionID))) {
            console.log('[growl-view] fast path – iouAction already in Onyx, dismissing immediately');
            const threadReportID = buildThreadFromOnyx('fast-path');
            showGrowlAndDismiss(threadReportID, 'onyx');
            return;
        }

        // Slow path: subscribe to the IOU report's reportActions and wait for our IOU action to appear.
        // Modal stays open during the wait → "Add expense" button spinner keeps spinning.
        const SAFETY_TIMEOUT_MS = 8000;
        let resolved = false;
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}` as const;
        console.log('[growl-view] slow path – subscribing to reportActions', {reportActionsKey, transactionID, safetyTimeoutMs: SAFETY_TIMEOUT_MS});
        const connectionId = Onyx.connectWithoutView({
            key: reportActionsKey,
            callback: () => {
                if (resolved || !iouReportID) {
                    return;
                }
                const iouAction = getIOUActionForReportID(iouReportID, transactionID);
                if (!iouAction?.reportActionID) {
                    console.log('[growl-view] reportActions callback – iouAction not yet present', {
                        iouActionExists: !!iouAction,
                    });
                    return;
                }
                resolved = true;
                Onyx.disconnect(connectionId);
                console.log('[growl-view] reportActions callback – iouAction landed in Onyx', {
                    iouActionReportActionID: iouAction.reportActionID,
                    iouActionChildReportID: iouAction.childReportID,
                });
                const threadReportID = buildThreadFromOnyx('onyx-landed');
                showGrowlAndDismiss(threadReportID, 'onyx');
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
            showGrowlAndDismiss(threadReportID, 'timeout');
        }, SAFETY_TIMEOUT_MS);

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
