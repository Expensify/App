import {addPendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';
import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Growl from '@libs/Growl';
import {translateLocal} from '@libs/Localize';
import Log from '@libs/Log';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
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

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import dismissModalAndOpenReportInInboxTab from './dismissModalAndOpenReportInInboxTab';
import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';
import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';
import setNavigationActionToMicrotaskQueue from './setNavigationActionToMicrotaskQueue';

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

let allTransactions: OnyxCollection<Transaction>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (transactions) => {
        allTransactions = transactions;
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

type ShowExpenseAddedGrowlParams = {
    iouReportID?: string;
    transactionID?: string;
    transactionThreadReportID?: string;

    /** Whether this confirmation is for an invoice (changes the toast copy from "Expense added"). */
    isInvoice?: boolean;
};

/**
 * Shows the "Expense added" growl with a "View" action that deep-links to the new expense's RHP.
 *
 * The IOU action's optimistic data is typically not yet in the Onyx cache when this runs — the
 * `API.write` is deferred (deferred-for-search pattern) until Search's content layout flushes the
 * channel. We subscribe to the iouReport's reportActions and wait for the optimistic iouAction
 * to land, then build the thread + show the growl. A safety timeout falls back to a growl
 * without the "View" link if the iouAction never appears.
 */
function showExpenseAddedGrowl({iouReportID, transactionID, transactionThreadReportID: providedTransactionThreadReportID, isInvoice}: ShowExpenseAddedGrowlParams) {
    if (!transactionID) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated -- imperative module (not a React component); no useLocalize hook available here
    const growlMessage = isInvoice ? translateLocal('iou.invoiceSent') : translateLocal('iou.expenseAdded');

    const buildThreadFromOnyx = (): string | undefined => {
        const iouReport = iouReportID ? getReportOrDraftReport(iouReportID) : undefined;
        const iouAction = iouReportID ? getIOUActionForReportID(iouReportID, transactionID) : undefined;
        let threadReportID = providedTransactionThreadReportID ?? iouAction?.childReportID;
        if (!threadReportID) {
            const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
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
        return threadReportID;
    };

    const showGrowl = (threadReportID: string | undefined) => {
        if (!threadReportID) {
            Log.warn('[showExpenseAddedGrowl] Unable to resolve transaction thread reportID; growl without View.');
            Growl.success(growlMessage, CONST.GROWL.DURATION_LONG);
            return;
        }
        const resolvedThreadReportID = threadReportID;
        const navigateToExpenseRHP = () => {
            const backTo = Navigation.getActiveRoute();
            // Resolved at press time (not growl-show time) so navigation matches whatever surface the
            // user is actually looking at, even if they switched tabs while the growl was up.
            const openOnInbox = isReportTopmostSplitNavigator() && !isSearchTopmostFullScreenRoute();

            if (!openOnInbox) {
                // Spend context: open the transaction thread RHP within Search (the report is shown
                // underneath via the Wide RHP machinery).
                setActiveTransactionIDs([transactionID]).then(() => {
                    Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: resolvedThreadReportID, backTo}));
                });
                return;
            }

            // Inbox + narrow layout: super wide RHP is unavailable, so open the transaction thread
            // as a full report view (matches MoneyRequestReportPreview's narrow-screen behavior).
            if (getIsNarrowLayout()) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(resolvedThreadReportID, undefined, undefined, backTo));
                return;
            }

            // Inbox + wide layout. A report with multiple transactions opens in a super wide RHP, so
            // we open the expense report underneath and stack the transaction thread RHP on top of it -
            // the super wide RHP keeps both visible as one cohesive surface. A single-transaction report
            // does NOT use the super wide RHP (see SearchMoneyRequestReportPage's `shouldShowSuperWideRHP`),
            // so stacking would surface as two separate RHP panels (RHP appears to open twice). In that
            // case navigate straight to the transaction thread instead; the report still shows underneath
            // via the Wide RHP machinery, matching the Spend-context path above.
            const hasMultipleReportTransactions =
                Object.values(allTransactions ?? {}).filter(
                    (transaction) => transaction?.reportID === iouReportID && transaction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                ).length > 1;

            if (iouReportID && hasMultipleReportTransactions) {
                Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: iouReportID, backTo}));
                // Defer so the thread RHP stacks on top of the expense report navigation above.
                setNavigationActionToMicrotaskQueue(() => {
                    setActiveTransactionIDs([transactionID]).then(() => {
                        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: resolvedThreadReportID, backTo: Navigation.getActiveRoute()}));
                    });
                });
                return;
            }
            setActiveTransactionIDs([transactionID]).then(() => {
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: resolvedThreadReportID, backTo}));
            });
        };
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- imperative module (not a React component); no useLocalize hook available here
        Growl.success(growlMessage, CONST.GROWL.DURATION_WITH_ACTION, {label: translateLocal('common.view'), onPress: navigateToExpenseRHP});
    };

    // Fast path: the thread is already resolvable, so show the growl immediately instead of waiting on
    // the reportActions subscription (which would otherwise hit the 8s safety timeout). This covers:
    // - personal tracked expenses (unreported/self-DM): there's no iouReportID, but the thread ID is
    //   passed in directly, so we can build from it right away;
    // - the iouAction already being in Onyx (retry / non-deferred edge cases).
    if (providedTransactionThreadReportID || (iouReportID && getIOUActionForReportID(iouReportID, transactionID)?.reportActionID)) {
        const threadReportID = buildThreadFromOnyx();
        showGrowl(threadReportID);
        return;
    }

    // No iouReportID to subscribe to (and no thread ID was passed): the reportActions key would be
    // `reportActions_undefined`, so the subscription below could never resolve an iouAction and would only
    // fire via the safety timeout. Resolve immediately with the same fallback the timeout would produce
    // (a growl without "View" when no thread is resolvable).
    if (!iouReportID) {
        showGrowl(buildThreadFromOnyx());
        return;
    }

    // Slow path: wait for Search to render → flushDeferredWrite('search') → API.write applies
    // optimistic data → iouAction lands → we show the growl.
    const SAFETY_TIMEOUT_MS = 8000;
    let resolved = false;
    let safetyTimeoutID: ReturnType<typeof setTimeout> | undefined;
    const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}` as const;
    const connectionId = Onyx.connectWithoutView({
        key: reportActionsKey,
        callback: () => {
            if (resolved) {
                return;
            }
            const iouAction = getIOUActionForReportID(iouReportID, transactionID);
            if (!iouAction?.reportActionID) {
                return;
            }
            resolved = true;
            clearTimeout(safetyTimeoutID);
            Onyx.disconnect(connectionId);
            const threadReportID = buildThreadFromOnyx();
            showGrowl(threadReportID);
        },
    });

    safetyTimeoutID = setTimeout(() => {
        if (resolved) {
            return;
        }
        resolved = true;
        Onyx.disconnect(connectionId);
        const threadReportID = buildThreadFromOnyx();
        showGrowl(threadReportID);
    }, SAFETY_TIMEOUT_MS);
}

type SurfaceExpenseCreatedFeedbackParams = {
    iouReportID?: string;
    transactionID?: string;
    transactionThreadReportID?: string;

    /**
     * Whether the expense was added from within its own expense report (i.e. the report table is the
     * surface in front of the user). When true we highlight the new row instead of showing a growl.
     */
    isMoneyRequestReport?: boolean;

    /** Whether this is an invoice (changes the growl copy). */
    isInvoice?: boolean;
};

/**
 * Surfaces post-create feedback when navigation is owned elsewhere (the dismiss-first orchestrator) or
 * isn't needed. Single decision point shared by every expense type:
 * - if the user is looking at the expense report's table (in-report add) → highlight the new row;
 * - otherwise → show the "Expense added" growl with a "View" deep link.
 */
function surfaceExpenseCreatedFeedback({iouReportID, transactionID, transactionThreadReportID, isMoneyRequestReport, isInvoice}: SurfaceExpenseCreatedFeedbackParams) {
    if (isMoneyRequestReport && iouReportID && transactionID) {
        addPendingNewTransactionIDs(iouReportID, transactionID);
        return;
    }
    showExpenseAddedGrowl({iouReportID, transactionID, transactionThreadReportID, isInvoice});
}

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

    // If the expense is not created from global create or there is no transaction to link,
    // we just need to dismiss the money request flow screens and open the report chat
    // containing the IOU report. No growl is shown in this case.
    if (!isFromGlobalCreate || !transactionID) {
        dismissModalAndOpenReportInInboxTab(activeReportID, isInvoice, hasMultipleTransactions);
        if (shouldAddPendingNewTransactionIDs) {
            addPendingNewTransactionIDs(activeReportID, transactionID);
        }
        return;
    }

    // From global create on the Inbox tab: stay on Inbox (dismiss the flow and open the report
    // chat containing the IOU report) and show the "Expense added" growl on top of it. We don't
    // redirect to Spend here - the growl just shows.
    if (isUserOnInbox) {
        dismissModalAndOpenReportInInboxTab(activeReportID, isInvoice, hasMultipleTransactions);
        if (shouldAddPendingNewTransactionIDs) {
            addPendingNewTransactionIDs(activeReportID, transactionID);
        }
        showExpenseAddedGrowl({iouReportID, transactionID, transactionThreadReportID: providedTransactionThreadReportID, isInvoice});
        return;
    }

    const type = isInvoice ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;

    // Navigate to Search (if not already there), then show the "View" growl on
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
    // SEARCH_FULLSCREEN_NAVIGATOR is nested inside TAB_NAVIGATOR, not at the root, and its `state`
    // can be undefined when the split navigator isn't actively rendered - so we resolve it via the
    // same TAB_NAVIGATOR traversal isSearchTopmostFullScreenRoute uses, then fall back to the
    // preserved navigator state for the search navigator's own inner routes.
    const searchNavigatorRoute = isUserOnSpend ? getTopmostFullScreenRoute() : undefined;
    const searchNavigatorState = searchNavigatorRoute?.state ?? (searchNavigatorRoute?.key ? getPreservedNavigatorState(searchNavigatorRoute.key) : undefined);
    const lastSearchRoute = searchNavigatorState?.routes?.at(-1);
    const alreadyOnSearchRoot = isUserOnSpend && lastSearchRoute?.name === SCREENS.SEARCH.ROOT;
    const currentSearchQueryJSON = alreadyOnSearchRoot ? getCurrentSearchQueryJSON() : undefined;
    const isSameSearchType = currentSearchQueryJSON?.type === type;

    setPendingSubmitFollowUpAction(
        alreadyOnSearchRoot && isSameSearchType ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH,
    );

    const navigateToSearch = () => {
        const isNarrow = getIsNarrowLayout();
        const isFullscreenPreInserted = Navigation.getIsFullscreenPreInsertedUnderRHP();
        if (isNarrow && isFullscreenPreInserted) {
            Navigation.clearFullscreenPreInsertedFlag();
            Navigation.dismissModal();
            return;
        }
        if (isNarrow) {
            const isRHPStillOnTop = navigationRef.getRootState()?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
            if (!alreadyOnSearchRoot || !isSameSearchType || isRHPStillOnTop) {
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
            }
            return;
        }
        if (alreadyOnSearchRoot && isSameSearchType) {
            return;
        }
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: queryString}));
    };

    if (navigationRef.isReady()) {
        navigateToSearch();
    } else {
        Navigation.isNavigationReady().then(navigateToSearch);
    }

    showExpenseAddedGrowl({iouReportID, transactionID, transactionThreadReportID: providedTransactionThreadReportID, isInvoice});
}

export default navigateAfterExpenseCreate;
export {surfaceExpenseCreatedFeedback};
