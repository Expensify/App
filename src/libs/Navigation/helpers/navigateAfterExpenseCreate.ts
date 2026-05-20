import Onyx from 'react-native-onyx';
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
    // show a loading growl while the backend confirms creation, then swap to a "View" growl that
    // deep-links to the new expense's RHP.
    if (!isUserOnSpend) {
        const queryStringForGrowl = buildCannedSearchQuery({type});
        console.log('[growl-view] entering growl branch', {
            transactionID,
            iouReportID,
            providedTransactionThreadReportID,
            isInvoice,
            activeReportID,
            queryStringForGrowl,
            currentUserEmail,
            currentUserAccountID,
        });
        Navigation.dismissModal();
        Growl.loading('Adding expense…');

        const navigateToExpenseRHP = () => {
            const iouReport = iouReportID ? getReportOrDraftReport(iouReportID) : undefined;
            const iouAction = iouReportID ? getIOUActionForReportID(iouReportID, transactionID) : undefined;
            let threadReportID = providedTransactionThreadReportID ?? iouAction?.childReportID;

            console.log('[growl-view] View clicked – resolving thread', {
                providedTransactionThreadReportID,
                iouActionExists: !!iouAction,
                iouActionReportActionID: iouAction?.reportActionID,
                iouActionChildReportID: iouAction?.childReportID,
                iouActionPendingAction: iouAction?.pendingAction,
                iouReportExists: !!iouReport,
                iouReportID: iouReport?.reportID,
                iouReportPolicyID: iouReport?.policyID,
                resolvedThreadReportID: threadReportID,
            });

            // Mirrors MoneyRequestReportTransactionList.navigateToTransaction: if no childReportID exists yet
            // (shouldGenerateTransactionThreadReport=false in useExpenseSubmission), build the optimistic
            // thread on the fly. createTransactionThreadReport internally calls openReport with the proper
            // newReportObject/participants/parent links, which is what prevents the BE auth error when
            // ReportScreen subsequently fetches the thread.
            if (!threadReportID) {
                const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                console.log('[growl-view] no childReportID – creating optimistic thread', {
                    transactionExists: !!transaction,
                    transactionPendingAction: transaction?.pendingAction,
                    transactionErrors: transaction?.errors,
                    transactionReportID: transaction?.reportID,
                    introSelectedExists: !!introSelected,
                    betasCount: betas?.length,
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
                console.log('[growl-view] createTransactionThreadReport result', {
                    optimisticThreadExists: !!optimisticThread,
                    optimisticThreadReportID: optimisticThread?.reportID,
                    optimisticThreadParentReportID: optimisticThread?.parentReportID,
                    optimisticThreadParentReportActionID: optimisticThread?.parentReportActionID,
                    optimisticThreadType: optimisticThread?.type,
                    optimisticThreadChatType: optimisticThread?.chatType,
                });
            } else {
                console.log('[growl-view] childReportID exists – calling setOptimisticTransactionThread', {threadReportID});
                setOptimisticTransactionThread(threadReportID, iouReport?.reportID, iouAction?.reportActionID, iouReport?.policyID);
            }

            if (!threadReportID) {
                console.log('[growl-view] BAILING – no threadReportID after fallback');
                Log.warn('[Growl View] Unable to resolve transaction thread reportID; skipping nav.');
                return;
            }

            // Capture the originating route BEFORE swapping the full-screen to Search so the RHP back arrow
            // returns the user to where they tapped "View" from (matches MoneyRequestReportTransactionList.navigateToTransaction).
            const backTo = Navigation.getActiveRoute();
            console.log('[growl-view] before SEARCH_ROOT swap', {backTo, threadReportID});
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryStringForGrowl}), {forceReplace: true});

            // Defer the RHP push until after the full-screen swap settles, matching navigateToTransaction's ordering.
            setActiveTransactionIDs([transactionID]).then(() => {
                const targetRoute = ROUTES.SEARCH_REPORT.getRoute({
                    reportID: threadReportID ?? '',
                    backTo,
                });
                console.log('[growl-view] setActiveTransactionIDs resolved – navigating to RHP', {
                    targetRoute,
                    threadReportID,
                });
                requestAnimationFrame(() => {
                    console.log('[growl-view] rAF fired – calling Navigation.navigate', {targetRoute});
                    Navigation.navigate(targetRoute);
                });
            });
        };

        // Wait for the backend success callback (transaction.pendingAction === null) before swapping the
        // loading growl to the "View" affordance. Bail after a safety timeout so we never hang forever.
        let resolved = false;
        const connectionId = Onyx.connectWithoutView({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            callback: (transaction) => {
                if (resolved || !transaction) {
                    console.log('[growl-view] transaction onyx callback ignored', {resolved, transactionExists: !!transaction});
                    return;
                }
                const hasErrors = !!transaction.errors && Object.keys(transaction.errors).length > 0;
                const isConfirmed = transaction.pendingAction === null || transaction.pendingAction === undefined;

                console.log('[growl-view] transaction onyx callback', {
                    transactionID,
                    pendingAction: transaction.pendingAction,
                    hasErrors,
                    errors: transaction.errors,
                    isConfirmed,
                    reportID: transaction.reportID,
                });

                if (hasErrors) {
                    resolved = true;
                    Onyx.disconnect(connectionId);
                    console.log('[growl-view] showing ERROR growl');
                    Growl.error('Failed to add expense', CONST.GROWL.DURATION_LONG);
                    return;
                }
                if (isConfirmed) {
                    resolved = true;
                    Onyx.disconnect(connectionId);
                    console.log('[growl-view] BE confirmed – swapping to SUCCESS growl with View action');
                    Growl.success('Expense added', 6000, {label: 'View', onPress: navigateToExpenseRHP});
                }
            },
        });

        setTimeout(() => {
            if (resolved) {
                return;
            }
            resolved = true;
            Onyx.disconnect(connectionId);
            console.log('[growl-view] TIMEOUT – BE never confirmed, showing SUCCESS growl anyway');
            // Backend never confirmed - still let the user navigate using the optimistic thread.
            Growl.success('Expense added', 6000, {label: 'View', onPress: navigateToExpenseRHP});
        }, 30000);

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
