import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import popReportsSplitNavigatorToReport from '@libs/Navigation/helpers/popReportsSplitNavigatorToReport';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isSelfDM, navigateBackOnDeleteTransaction} from '@libs/ReportUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {isTracking, setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import {getChildTransactions} from '@libs/TransactionUtils';

import type {UpdateSplitTransactionsParams} from '@userActions/IOU/SplitTransactionUpdate';
import {updateSplitTransactions} from '@userActions/IOU/SplitTransactionUpdate';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import {mergeTransactionIdsHighlightOnSearchRoute} from '@userActions/Transaction';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

/**
 * Saves the split-expenses flow: writes the splits through updateSplitTransactions and moves the user off screens the save
 * invalidates. Which screens those are depends on where the save was started from, which only the view layer knows.
 */
function updateSplitTransactionsFromSplitExpensesFlow(params: UpdateSplitTransactionsParams) {
    // Detect if this will be a reverse split that deletes the expense report.
    // When splits are reduced to 1, updateSplitTransactions performs a reverse split which
    // optimistically deletes the expense report if it's the last transaction. We need to
    // set the navigate-back URL before the deletion to prevent the "Not Found" page.
    const splitExpenses = params.transactionData?.splitExpenses ?? [];
    const originalTransactionID = params.transactionData?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const allChildTransactions = getChildTransactions(params.allTransactionsList, originalTransactionID);
    const hasEditableSplitExpensesLeft = splitExpenses.some((expense) => (expense.statusNum ?? 0) < CONST.REPORT.STATUS_NUM.SUBMITTED);

    // Unfiltered, so a pure selfDM 2-split still collapses via REVERT_SPLIT_TRANSACTION. The mixed
    // workspace/selfDM case is guarded below via reverseSplitKeepsOriginalInExpenseReport instead.
    const isReverseSplitOperation = splitExpenses.length === 1 && allChildTransactions.length > 0 && hasEditableSplitExpensesLeft;

    // Newly created split transaction IDs, excluding ones already present in allChildTransactions.
    function getNewSplitTransactionIDs(): string[] {
        const existingChildTransactionIDs = new Set(allChildTransactions.map((tx) => tx?.transactionID).filter(Boolean));
        return splitExpenses.map((splitExpense) => splitExpense.transactionID).filter((transactionID) => transactionID && !existingChildTransactionIDs.has(transactionID));
    }
    const expenseReportID = params.expenseReport?.reportID;

    // Detect whether the expense report the user is editing from will be emptied by this save.
    // This covers both the pure-workspace reverse-split (handled by isReverseSplitOperation above)
    // and broader cases — e.g. the user had splits spread across multiple reports and removed all
    // splits belonging to the current expense report, or the only remaining split moved to selfDM.
    // In any of these cases we must navigate away from the soon-to-be-empty report so the user
    // isn't stranded on a "Not Found" page.
    const expenseReportTransactions = expenseReportID ? Object.values(params.allTransactionsList ?? {}).filter((itemTransaction) => itemTransaction?.reportID === expenseReportID) : [];
    const areAllExpenseReportTransactionsSplitChildren =
        expenseReportTransactions.length > 0 && expenseReportTransactions.every((itemTransaction) => itemTransaction?.comment?.originalTransactionID === originalTransactionID);
    const anyRemainingSplitStaysInExpenseReport = splitExpenses.some((expense) => expense.reportID === expenseReportID);
    const reverseSplitKeepsOriginalInExpenseReport = isReverseSplitOperation && splitExpenses.at(0)?.reportID === expenseReportID;
    const willExpenseReportBecomeEmpty =
        !!expenseReportID && areAllExpenseReportTransactionsSplitChildren && !anyRemainingSplitStaysInExpenseReport && !reverseSplitKeepsOriginalInExpenseReport;
    const isLastTransactionInReport =
        willExpenseReportBecomeEmpty ||
        (isReverseSplitOperation &&
            !reverseSplitKeepsOriginalInExpenseReport &&
            Object.values(params.allTransactionsList ?? {}).filter((itemTransaction) => itemTransaction?.reportID === expenseReportID).length === 1);
    const fallbackReportID = params.expenseReport?.chatReportID ?? params.expenseReport?.parentReportID;

    if (isLastTransactionInReport && fallbackReportID) {
        setDeleteTransactionNavigateBackUrl(ROUTES.REPORT_WITH_ID.getRoute(fallbackReportID));
    }

    const isSearchPageTopmostFullScreenRoute = isSearchTopmostFullScreenRoute();
    const isSelfDMSplit = !isSearchPageTopmostFullScreenRoute && isSelfDM(params.transactionReport) && !!params.transactionReport?.reportID;

    // For selfDM splits, navigate back to the selfDM report BEFORE the data update and delay
    // updateSplitTransactions until after the navigation animation completes. This prevents
    // the brief "Not Found" flash caused by the original transaction being deleted while
    // the transaction thread is still visible in the central pane.
    //
    // Pop any intermediate report screens above selfDM in the REPORTS_SPLIT_NAVIGATOR
    // (e.g. the original transaction's thread) BEFORE dismissing the modal. Those screens
    // become stale after the split because the original transaction's reportID is set to
    // SPLIT_REPORT_ID, so if the modal dismissal animation revealed them, the user would
    // briefly see FullPageNotFoundView before the pop landed them on selfDM.
    const selfDMReportID = params.transactionReport?.reportID;
    if (isSelfDMSplit && selfDMReportID) {
        popReportsSplitNavigatorToReport(selfDMReportID);
        Navigation.dismissModal();
        requestAnimationFrame(() => {
            // Navigates to selfDM, not the expense report - nothing mounts to consume the highlight rail.
            updateSplitTransactions({...params, isFromSplitExpensesFlow: true, shouldSkipReportHighlightRail: true});
        });
        params?.searchContext?.clearSelectedTransactions?.(true);
        return;
    }

    const transactionThreadReportID = params.firstIOU?.childReportID;
    const transactionThreadReportScreen = Navigation.getReportRouteByID(transactionThreadReportID);

    // Reset selected transactions in search after saving split expenses
    const searchFullScreenRoutes = navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastRoute = searchFullScreenRoutes?.state?.routes?.at(-1);
    const isUserOnSearchPage = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.ROOT;
    if (isUserOnSearchPage) {
        params?.searchContext?.clearSelectedTransactions?.(undefined, true);
    } else {
        params?.searchContext?.clearSelectedTransactions?.(true);
    }

    const targetReportID = params.expenseReport?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);

    // Register newly created split transaction IDs so they briefly highlight on the Search/Spend page.
    // The Search page reads TRANSACTION_IDS_HIGHLIGHT_ON_SEARCH_ROUTE, which highlights matching rows
    // optimistically without waiting for a server re-search. Unlike the auto-detect path in
    // useSearchHighlightAndScroll (skipped while offline), this makes the highlight work offline too.
    // Reverse splits create no new transactions, and existing children are already in the list, so both are skipped.
    function registerSearchRouteHighlight() {
        if (!isSearchPageTopmostFullScreenRoute || isReverseSplitOperation) {
            return;
        }
        const currentSearchType = getCurrentSearchQueryJSON()?.type;
        if (!currentSearchType) {
            return;
        }
        const newTransactionIDsToHighlight: Record<string, boolean> = {};
        for (const transactionID of getNewSplitTransactionIDs()) {
            newTransactionIDsToHighlight[transactionID] = true;
        }
        if (isEmptyObject(newTransactionIDsToHighlight)) {
            return;
        }
        mergeTransactionIdsHighlightOnSearchRoute(currentSearchType, newTransactionIDsToHighlight);
    }

    if (isSearchPageTopmostFullScreenRoute || !params.transactionReport?.parentReportID) {
        registerSearchRouteHighlight();
        // Returns to Search, not the expense report, so rail flags would sit unconsumed and highlight stale rows the
        // next time that report is opened from the Inbox. registerSearchRouteHighlight above covers this page instead.
        updateSplitTransactions({...params, isFromSplitExpensesFlow: true, shouldSkipReportHighlightRail: true});

        if (!isSelfDMSplit) {
            Navigation.navigateBackToLastSuperWideRHPScreen();
        }

        // After the modal is dismissed, remove the transaction thread report screen
        // to avoid navigating back to a report removed by the split transaction.
        requestAnimationFrame(() => {
            if (!transactionThreadReportScreen?.key) {
                return;
            }

            Navigation.removeScreenByKey(transactionThreadReportScreen.key);
        });

        return;
    }

    // When the reverse split deletes the expense report, use the backward navigation pattern
    // (dismissToSuperWideRHP + goBack) instead of dismissModalWithReport. This naturally pops
    // stale screens from the stack instead of leaving them behind.
    if (isLastTransactionInReport && fallbackReportID) {
        // Navigates to the fallback report, not the expense report - nothing mounts to consume the highlight rail.
        updateSplitTransactions({...params, isFromSplitExpensesFlow: true, shouldSkipReportHighlightRail: true});

        const backRoute = ROUTES.REPORT_WITH_ID.getRoute(fallbackReportID);
        navigateBackOnDeleteTransaction(backRoute);

        // Remove the transaction thread report screen to avoid navigating back to a removed report
        requestAnimationFrame(() => {
            if (!transactionThreadReportScreen?.key) {
                return;
            }
            Navigation.removeScreenByKey(transactionThreadReportScreen.key);
        });

        return;
    }

    if (isTracking()) {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, targetReportID);
    }

    popReportsSplitNavigatorToReport(targetReportID);
    Navigation.dismissModalWithReport({reportID: targetReportID});
    requestAnimationFrame(() => {
        updateSplitTransactions({...params, isFromSplitExpensesFlow: true});
        if (!transactionThreadReportScreen?.key) {
            return;
        }
        Navigation.removeScreenByKey(transactionThreadReportScreen.key);
    });
}

export default updateSplitTransactionsFromSplitExpensesFlow;
