import {useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getReportPreviewAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCombinedReportActions, getFilteredReportActionsForReportView, isCreatedAction} from '@libs/ReportActionsUtils';
import {isConciergeChatReport, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread as isReportTransactionThreadUtil} from '@libs/ReportUtils';
import getReportActionsToDisplay from '@pages/inbox/report/getReportActionsToDisplay';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useTransactionThread from './useTransactionThread';

type UseReportActionsPaginationResult = {
    reportActions: ReportAction[];
    allReportActions: ReportAction[];
    allReportActionIDs: string[];
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

    const [treatAsNoPaginationAnchor, setTreatAsNoPaginationAnchor] = useState(false);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeChat = isConciergeChatReport(report, conciergeReportID);

    const {
        reportActions: unfilteredReportActions,
        hasOlderActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
    } = usePaginatedReportActions(reportID, reportActionIDFromRoute, {
        shouldLinkToOldestUnreadReportAction: true,
        treatAsNoPaginationAnchor,
        // Scope the first-defined lastReadTime snapshot to Concierge so the cold-open unread anchor resolves
        // (https://github.com/Expensify/App/issues/93196) without changing regular inbox chat pagination.
        shouldSnapshotInitialLastReadTime: isConciergeChat,
    });
    const allReportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);

    const thread = useTransactionThread({reportID, report, allReportActions, isOffline});

    const isReportTransactionThread = isReportTransactionThreadUtil(report);

    const lastAction = allReportActions?.at(-1);
    const shouldAddCreatedAction = !isCreatedAction(lastAction) && (isMoneyRequestReport(report) || isInvoiceReport(report) || isReportTransactionThread || isConciergeChat);

    const [chatReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.chatReportID)}`);
    const reportPreviewAction = useMemo(() => getReportPreviewAction(report?.chatReportID, report?.reportID, chatReportActions), [report?.chatReportID, report?.reportID, chatReportActions]);

    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    const reportActionsToDisplay = useMemo(
        () => getReportActionsToDisplay(allReportActions, lastAction, report, reportPreviewAction, thread.transactionThreadReport, shouldAddCreatedAction),
        [allReportActions, lastAction, report, reportPreviewAction, shouldAddCreatedAction, thread.transactionThreadReport],
    );

    const reportActions = useMemo(
        () => (reportActionsToDisplay ? getCombinedReportActions(reportActionsToDisplay, thread.transactionThreadReportID ?? null, thread.transactionThreadReportActions ?? []) : []),
        [reportActionsToDisplay, thread.transactionThreadReportActions, thread.transactionThreadReportID],
    );

    const allReportActionIDs = useMemo(() => allReportActions.map((action) => action.reportActionID), [allReportActions]);

    return {
        reportActions,
        allReportActions,
        allReportActionIDs,
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

export default useReportActionsPagination;
