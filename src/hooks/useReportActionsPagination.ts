import {getReportPreviewReportAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCombinedReportActions, getFilteredReportActionsForReportView, isCreatedAction, isTransactionThread} from '@libs/ReportActionsUtils';
import {isConciergeChatReport, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread as isReportTransactionThreadUtil, shouldReportAlignToTop} from '@libs/ReportUtils';

import getReportActionsToDisplay, {buildPlaceholderCreatedAction, buildPlaceholderExpenseAction} from '@pages/inbox/report/getReportActionsToDisplay';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useState} from 'react';

import {useCurrencyListActions} from './useCurrencyList';
import useDelegateAccountID from './useDelegateAccountID';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useParentReportAction from './useParentReportAction';
import useTransactionThread from './useTransactionThread';

type UseReportActionsPaginationResult = {
    reportActions: ReportAction[];
    allReportActions: ReportAction[];
    allReportActionIDs: string[];
    persistedReportActionIDs: string[];
    hasOlderActions: boolean;
    hasNewerActions: boolean;
    sortedAllReportActions: ReportAction[] | undefined;
    oldestUnreadReportAction: ReportAction | undefined;
    transactionThreadReportID: string | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    parentReportActionForTransactionThread: ReportAction | undefined;
    treatAsNoPaginationAnchor: boolean;
    setTreatAsNoPaginationAnchor: (value: boolean) => void;
    reportPreviewAction: OnyxEntry<ReportAction> | null;
};

function useReportActionsPagination(reportID: string | undefined, reportActionIDFromRoute: string | undefined): UseReportActionsPaginationResult {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {isOffline} = useNetwork();
    const parentReportAction = useParentReportAction(report);

    const [treatAsNoPaginationAnchor, setTreatAsNoPaginationAnchor] = useState(false);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const shouldBeAlignedToTop = shouldReportAlignToTop(report, parentReportAction);

    const {
        reportActions: unfilteredReportActions,
        hasOlderActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
    } = usePaginatedReportActions(reportID, reportActionIDFromRoute, {
        shouldLinkToOldestUnreadReportAction: !shouldBeAlignedToTop,
        treatAsNoPaginationAnchor,
        // Scope the first-defined lastReadTime snapshot to Concierge so the cold-open unread anchor resolves
        // (https://github.com/Expensify/App/issues/93196) without changing regular inbox chat pagination.
        shouldSnapshotInitialLastReadTime: isConciergeChatReport(report, conciergeReportID),
    });
    const {allReportActions, reportPreviewAction, hasPendingExpense, hasMissingExpenses} = useReportExpenseActions(report, unfilteredReportActions);
    const thread = useTransactionThread({reportID, report, allReportActions, isOffline});
    const oldestActionForPlaceholder = allReportActions.at(-1);
    const {placeholderCreatedAction, placeholderExpenseAction} = usePlaceholderReportActions({
        reportID,
        ownerAccountID: report?.ownerAccountID,
        oldestActionCreated: oldestActionForPlaceholder?.created,
        shouldAddCreatedAction:
            !isCreatedAction(oldestActionForPlaceholder) &&
            (isMoneyRequestReport(report) || isInvoiceReport(report) || isReportTransactionThreadUtil(report) || isConciergeChatReport(report, conciergeReportID)),
        shouldAddExpenseAction: hasMissingExpenses && isEmptyObject(thread.transactionThreadReport),
    });

    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    const reportActionsToDisplay = getReportActionsToDisplay({
        reportViewActions: allReportActions,
        isMoneyRequestReport: isMoneyRequestReport(report),
        hasPendingExpense,
        placeholderCreatedAction,
        placeholderExpenseAction,
    });

    const reportActions = reportActionsToDisplay
        ? getCombinedReportActions(reportActionsToDisplay, thread.transactionThreadReportID ?? null, thread.transactionThreadReportActions ?? [])
        : [];

    const allReportActionIDs = allReportActions.map((action) => action.reportActionID);
    // A one-expense report shows the comments of its transaction thread. Onyx stores those comments under the
    // reportID of the thread, therefore allReportActionIDs does not contain them.
    const persistedReportActionIDs = [...allReportActionIDs, ...(thread.transactionThreadReportActions ?? []).map((action) => action.reportActionID)];

    return {
        reportActions,
        allReportActions,
        allReportActionIDs,
        persistedReportActionIDs,
        hasOlderActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReportID: thread.transactionThreadReportID,
        transactionThreadReport: thread.transactionThreadReport,
        parentReportActionForTransactionThread: thread.parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
        reportPreviewAction,
    };
}

function useReportExpenseActions(report: OnyxEntry<Report>, unfilteredReportActions: ReportAction[]) {
    const [chatReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.chatReportID)}`);
    const reportPreviewAction = getReportPreviewReportAction(report?.chatReportID, report?.reportID, chatReportActions);
    const isMoneyRequest = isMoneyRequestReport(report);
    const allReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const moneyRequestActions = isMoneyRequest ? allReportActions.filter(isTransactionThread) : undefined;
    const hasPendingExpense = moneyRequestActions?.some((action) => !!action.pendingAction) ?? false;
    // Keep the total visible while offline cached actions contain fewer expenses than the report preview.
    const hasMissingExpenses = !!moneyRequestActions && allReportActions.length > 0 && !!report?.total && moneyRequestActions.length < (reportPreviewAction?.childMoneyRequestCount ?? 0);
    return {allReportActions, reportPreviewAction, hasPendingExpense, hasMissingExpenses};
}

type PlaceholderReportActionsParams = {
    reportID: string | undefined;
    ownerAccountID: number | undefined;
    oldestActionCreated: string | undefined;
    shouldAddCreatedAction: boolean;
    shouldAddExpenseAction: boolean;
};

/** Isolates placeholder inputs so unrelated Onyx writes cannot invalidate their compiler cache. */
function usePlaceholderReportActions({reportID, ownerAccountID, oldestActionCreated, shouldAddCreatedAction, shouldAddExpenseAction}: PlaceholderReportActionsParams) {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();
    const placeholderCreatedAction = shouldAddCreatedAction ? buildPlaceholderCreatedAction(reportID, ownerAccountID, oldestActionCreated) : undefined;
    const placeholderExpenseAction = shouldAddExpenseAction
        ? buildPlaceholderExpenseAction(reportID, placeholderCreatedAction?.created ?? oldestActionCreated, delegateAccountID, getCurrencyDecimals)
        : undefined;
    return {placeholderCreatedAction, placeholderExpenseAction};
}

export default useReportActionsPagination;
