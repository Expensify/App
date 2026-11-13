import {getReportPreviewReportAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCombinedReportActions, getFilteredReportActionsForReportView, isCreatedAction} from '@libs/ReportActionsUtils';
import {
    canUserPerformWriteAction,
    isConciergeChatReport,
    isInvoiceReport,
    isMoneyRequestReport,
    isReportTransactionThread as isReportTransactionThreadUtil,
    shouldReportAlignToTop,
} from '@libs/ReportUtils';

import getReportActionsToDisplay from '@pages/inbox/report/getReportActionsToDisplay';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useState} from 'react';

import {useCurrencyListActions} from './useCurrencyList';
import useDelegateAccountID from './useDelegateAccountID';
import useLinkedActionTransactionThread from './useLinkedActionTransactionThread';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useParentReportAction from './useParentReportAction';
import useReportIsArchived from './useReportIsArchived';
import useTransactionThread, {selectTransactionThreadReportActions} from './useTransactionThread';

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
    const {getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();
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
    const thread = useTransactionThread({reportID, report, allReportActions: getFilteredReportActionsForReportView(unfilteredReportActions), isOffline});

    const {linkedActionTransactionThreadReportID, isLinkedActionInMergedTransactionThread} = useLinkedActionTransactionThread(report, sortedAllReportActions, reportActionIDFromRoute);

    const [chatReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.chatReportID)}`);

    // useTransactionThread resolves the thread from the paginated window, so it comes back empty when the IOU action sits in an older page.
    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);
    const fallbackThreadReportID = !thread.transactionThreadReportID && isLinkedActionInMergedTransactionThread ? linkedActionTransactionThreadReportID : undefined;
    const [fallbackThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(fallbackThreadReportID)}`);
    const [fallbackThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(fallbackThreadReportID)}`, {
        // Mirror useTransactionThread's write permission so a read-only user doesn't see actionable whispers here.
        selector: (actions: OnyxEntry<ReportActions>) => selectTransactionThreadReportActions(!!canPerformWriteAction, fallbackThreadReportID, actions),
    });

    // React Compiler does not memoize a value created before a hook call and used after it, so these are computed again below the last hook.
    const allReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const isConciergeChat = isConciergeChatReport(report, conciergeReportID);

    const transactionThreadReportID = thread.transactionThreadReportID ?? fallbackThreadReportID;
    const transactionThreadReport = thread.transactionThreadReport ?? fallbackThreadReport;
    const transactionThreadReportActions = thread.transactionThreadReportID ? (thread.transactionThreadReportActions ?? []) : (fallbackThreadReportActions ?? []);

    const isReportTransactionThread = isReportTransactionThreadUtil(report);

    const lastAction = allReportActions?.at(-1);
    const shouldAddCreatedAction = !isCreatedAction(lastAction) && (isMoneyRequestReport(report) || isInvoiceReport(report) || isReportTransactionThread || isConciergeChat);

    const reportPreviewAction = getReportPreviewReportAction(report?.chatReportID, report?.reportID, chatReportActions);

    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    const reportActionsToDisplay = getReportActionsToDisplay(
        allReportActions,
        lastAction,
        report,
        reportPreviewAction,
        transactionThreadReport,
        shouldAddCreatedAction,
        getCurrencyDecimals,
        delegateAccountID,
    );

    const reportActions = reportActionsToDisplay ? getCombinedReportActions(reportActionsToDisplay, transactionThreadReportID ?? null, transactionThreadReportActions) : [];

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
        transactionThreadReportID,
        transactionThreadReport,
        parentReportActionForTransactionThread: thread.parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
        reportPreviewAction,
    };
}

export default useReportActionsPagination;
