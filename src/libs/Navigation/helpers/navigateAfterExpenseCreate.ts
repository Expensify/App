import {addPendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';
import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {runAfterDeferredWrite} from '@libs/deferredLayoutWrite';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Growl from '@libs/Growl';
import {translateLocal} from '@libs/Localize';
import Log from '@libs/Log';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getReportTransactions} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Beta, IntroSelected, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import dismissModalAndOpenReportInInboxTab from './dismissModalAndOpenReportInInboxTab';
import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';
import isReportOpenInRHP from './isReportOpenInRHP';
import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';
import setNavigationActionToMicrotaskQueue from './setNavigationActionToMicrotaskQueue';

type BuildTransactionThreadParams = {
    /** Current user's email. */
    currentUserLogin: string;

    /** Current user's account ID. */
    currentUserAccountID: number;

    /** Enabled betas. */
    betas: Beta[] | undefined;

    /** The onboarding intro selection. */
    introSelected: IntroSelected | undefined;
};

type NavigateAfterExpenseCreateParams = {
    /** Report to open when navigation stays on the Inbox tab. */
    activeReportID?: string;

    /** IOU report the transaction landed in, used to resolve the growl's "View" deep link. */
    iouReportID?: string;

    /** The created transaction's ID. */
    transactionID?: string;

    /** Transaction thread report the growl's "View" action opens. */
    transactionThreadReportID?: string;

    /** Whether the expense was created from the global create (FAB). */
    isFromGlobalCreate?: boolean;

    /** Whether the expense is an invoice. */
    isInvoice?: boolean;

    /** Whether the target report already holds other transactions. */
    hasMultipleTransactions: boolean;

    /** Mark the new transaction for the in-report row highlight. */
    shouldAddPendingNewTransactionIDs?: boolean;

    /** Show the "Expense added" growl even on the non-global-create path (e.g. the Share flow, whose drafts never set isFromGlobalCreate). */
    shouldAlwaysShowFeedback?: boolean;

    /** Data the "View" action needs to build the transaction thread. */
    buildTransactionThreadParams?: BuildTransactionThreadParams;
};

type ShowExpenseAddedGrowlParams = {
    /** IOU report the transaction landed in, used to resolve the growl's "View" deep link. */
    iouReportID?: string;

    /** The created transaction's ID. */
    transactionID?: string;

    /** Transaction thread report the growl's "View" action opens. */
    transactionThreadReportID?: string;

    /** Whether this confirmation is for an invoice (changes the toast copy from "Expense added"). */
    isInvoice?: boolean;

    /** Data the "View" action needs to build the transaction thread when no thread ID is known yet. */
    buildTransactionThreadParams?: BuildTransactionThreadParams;
};

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
            // push (never a replace) — it stacks on the report we just opened, not on the previously-open one.
            setNavigationActionToMicrotaskQueue(() => {
                setActiveTransactionIDs([transactionID]).then(() => {
                    Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID, backTo: Navigation.getActiveRoute()}));
                });
            });
        }
        return;
    }

    // Tracked/unreported expense: there's no expense report to open, so go straight to the transaction thread.
    setActiveTransactionIDs([transactionID]).then(() => {
        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID, backTo}), {forceReplace});
    });
}

/**
 * Shows the "Expense added" growl with a "View" action that deep-links to the new expense's RHP.
 *
 * The IOU action's optimistic data is typically not yet in the Onyx cache when this runs — the
 * `API.write` is deferred (deferred-for-search pattern) until Search's content layout flushes the
 * channel. `runAfterDeferredWrite` shows the growl right after that write applies (its channel's own
 * safety timeout guarantees it fires). If no write is pending, the growl shows immediately.
 *
 * The transaction thread itself is only materialized (context merge, or optimistic creation with
 * its OpenReport write) when the user actually presses "View" — matching how every other thread
 * navigation entry point builds the thread at navigation time, and keeping untapped growls free
 * of Onyx/API side effects.
 *
 * Callers must only invoke this for expenses that resolve to a single transaction thread (a provided
 * thread ID, an IOU report to build one from, or the created transaction). Splits fan out into one
 * thread per participant, so they skip the growl at the call site rather than showing a dead "View".
 */
function showExpenseAddedGrowl({
    iouReportID,
    transactionID,
    transactionThreadReportID: providedTransactionThreadReportID,
    isInvoice,
    buildTransactionThreadParams,
}: ShowExpenseAddedGrowlParams) {
    if (!transactionID) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated -- imperative module (not a React component); no useLocalize hook available here
    const growlMessage = isInvoice ? translateLocal('iou.invoiceSent') : translateLocal('iou.expenseAdded');

    // Reads the freshest IOU report and its IOU action - the server-created transaction thread's
    // childReportID lands on the IOU action only after creation, so a value captured at growl-show time
    // would be stale and would fabricate a duplicate optimistic thread.
    const resolveIOUReportAndAction = async (): Promise<{iouReport: OnyxEntry<Report>; iouAction: OnyxEntry<ReportAction>}> => {
        if (!iouReportID) {
            return {iouReport: undefined, iouAction: undefined};
        }
        const [iouReport, iouReportActions] = await Promise.all([
            new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            }),
            new Promise<OnyxEntry<ReportActions>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            }),
        ]);
        const iouAction = getIOUActionForTransactionID(Object.values(iouReportActions ?? {}), transactionID);
        return {iouReport, iouAction};
    };

    // Resolve the created transaction fresh from Onyx by its ID rather than capturing an object at
    // feedback-creation time.
    const resolveTransaction = (): Promise<OnyxEntry<Transaction>> =>
        new Promise<OnyxEntry<Transaction>>((resolve) => {
            const connection = Onyx.connectWithoutView({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });

    const buildThreadFromOnyx = async (): Promise<string | undefined> => {
        const {iouReport, iouAction} = await resolveIOUReportAndAction();
        const threadReportID = providedTransactionThreadReportID ?? iouAction?.childReportID;
        if (threadReportID) {
            setOptimisticTransactionThread(threadReportID, iouReport?.reportID, iouAction?.reportActionID, iouReport?.policyID);
            return threadReportID;
        }
        const transaction = await resolveTransaction();
        const optimisticThread = createTransactionThreadReport({
            introSelected: buildTransactionThreadParams?.introSelected,
            currentUserLogin: buildTransactionThreadParams?.currentUserLogin ?? '',
            currentUserAccountID: buildTransactionThreadParams?.currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
            betas: buildTransactionThreadParams?.betas,
            iouReport,
            iouReportAction: iouAction,
            transaction,
        });
        return optimisticThread?.reportID;
    };

    const showGrowl = () => {
        const navigateToExpenseRHP = () => {
            // Everything resolves at press time (not growl-show time): the thread is only materialized
            // if the user actually taps "View" (with the freshest data available by then), and navigation
            // matches whatever surface the user is looking at, even if they switched tabs while the
            // growl was up.
            buildThreadFromOnyx().then((threadReportID) => {
                if (!threadReportID) {
                    Log.warn('[showExpenseAddedGrowl] Unable to resolve transaction thread reportID on View press.');
                    return;
                }
                navigateToCreatedExpense({threadReportID, transactionID, iouReportID});
            });
        };
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- imperative module (not a React component); no useLocalize hook available here
        Growl.success(growlMessage, CONST.GROWL.DURATION_WITH_ACTION, {label: translateLocal('common.view'), onPress: navigateToExpenseRHP});
    };

    // The optimistic IOU action may still be sitting inside a deferred write (the deferred-for-search
    // pattern), in which case a provided thread ID isn't enough yet - its report data is in that same
    // write, so "View" would open a broken RHP. Show the growl once the pending write has applied,
    // if nothing is pending, this runs synchronously.
    runAfterDeferredWrite(showGrowl);
}

type SurfaceExpenseCreatedFeedbackParams = {
    /** IOU report the transaction landed in, used to resolve the growl's "View" deep link. */
    iouReportID?: string;

    /** The created transaction. */
    transactionID?: string;

    /** Transaction thread report the growl's "View" action opens. */
    transactionThreadReportID?: string;

    /**
     * Whether the expense was added from within its own expense report (i.e. the report table is the
     * surface in front of the user). When true we highlight the new row instead of showing a growl.
     */
    isMoneyRequestReport?: boolean;

    /** Whether the expense is an invoice (changes the growl copy). */
    isInvoice?: boolean;

    /** Data the "View" action needs to build the transaction thread. */
    buildTransactionThreadParams?: BuildTransactionThreadParams;
};

/**
 * Surfaces post-create feedback when navigation is owned elsewhere (the dismiss-first orchestrator) or
 * isn't needed. Single decision point shared by every expense type:
 * - if the user is looking at the expense report's table (in-report add) → highlight the new row;
 * - otherwise → show the "Expense added" growl with a "View" deep link.
 */
function surfaceExpenseCreatedFeedback({
    iouReportID,
    transactionID,
    transactionThreadReportID,
    isMoneyRequestReport,
    isInvoice,
    buildTransactionThreadParams,
}: SurfaceExpenseCreatedFeedbackParams) {
    if (isMoneyRequestReport && iouReportID && transactionID) {
        addPendingNewTransactionIDs(iouReportID, transactionID);
        return;
    }
    showExpenseAddedGrowl({iouReportID, transactionID, transactionThreadReportID, isInvoice, buildTransactionThreadParams});
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
    shouldAlwaysShowFeedback = false,
    buildTransactionThreadParams,
}: NavigateAfterExpenseCreateParams) {
    const isUserOnInbox = isReportTopmostSplitNavigator();
    const isUserOnSpend = isSearchTopmostFullScreenRoute();

    // If the expense is not created from global create or there is no transaction to link,
    // we just need to dismiss the money request flow screens and open the report chat
    // containing the IOU report. No growl is shown in this case (landing in the report is
    // the feedback), unless the caller opts in via shouldAlwaysShowFeedback.
    if (!isFromGlobalCreate || !transactionID) {
        dismissModalAndOpenReportInInboxTab(activeReportID, isInvoice, hasMultipleTransactions);
        if (shouldAddPendingNewTransactionIDs) {
            addPendingNewTransactionIDs(activeReportID, transactionID);
        }
        if (shouldAlwaysShowFeedback && transactionID) {
            showExpenseAddedGrowl({iouReportID, transactionID, transactionThreadReportID: providedTransactionThreadReportID, isInvoice, buildTransactionThreadParams});
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
        showExpenseAddedGrowl({iouReportID, transactionID, transactionThreadReportID: providedTransactionThreadReportID, isInvoice, buildTransactionThreadParams});
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

    showExpenseAddedGrowl({iouReportID, transactionID, transactionThreadReportID: providedTransactionThreadReportID, isInvoice, buildTransactionThreadParams});
}

export default navigateAfterExpenseCreate;
export {surfaceExpenseCreatedFeedback, navigateToCreatedExpense};
export type {BuildTransactionThreadParams};
