import {useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getReportPreviewAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCombinedReportActions, getFilteredReportActionsForReportView, isCreatedAction} from '@libs/ReportActionsUtils';
import {isConciergeChatReport, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread as isReportTransactionThreadUtil} from '@libs/ReportUtils';
import getReportActionsToDisplay from '@pages/inbox/report/getReportActionsToDisplay';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Pages, Report, ReportAction} from '@src/types/onyx';
import useIsInSidePanel from './useIsInSidePanel';
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
    reportActionPages: OnyxEntry<Pages>;
    transactionThreadReportID: string | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    parentReportActionForTransactionThread: ReportAction | undefined;
    shouldAddCreatedAction: boolean;
    treatAsNoPaginationAnchor: boolean;
    setTreatAsNoPaginationAnchor: (value: boolean) => void;
};

function useReportActionsPagination(reportID: string | undefined, reportActionIDFromRoute: string | undefined): UseReportActionsPaginationResult {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {isOffline} = useNetwork();

    const [treatAsNoPaginationAnchor, setTreatAsNoPaginationAnchor] = useState(false);
    const nonEmptyReportIDForPages = getNonEmptyStringOnyxID(reportID);
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${nonEmptyReportIDForPages}`);

    const {
        reportActions: unfilteredReportActions,
        hasOlderActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
    } = usePaginatedReportActions(reportID, reportActionIDFromRoute, {
        shouldLinkToOldestUnreadReportAction: true,
        treatAsNoPaginationAnchor,
    });
    const allReportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);

    const thread = useTransactionThread({reportID, report, allReportActions, isOffline});

    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);

    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
    const isLoadingInitialReportActions = reportLoadingState?.isLoadingInitialReportActions;

    const isReportTransactionThread = isReportTransactionThreadUtil(report);
    const isInitiallyLoadingTransactionThread = isReportTransactionThread && (!!isLoadingInitialReportActions || (allReportActions ?? [])?.length <= 1);

    const lastAction = allReportActions?.at(-1);
    const shouldAddCreatedAction = !isCreatedAction(lastAction) && (isMoneyRequestReport(report) || isInvoiceReport(report) || isInitiallyLoadingTransactionThread || isConciergeSidePanel);

    const reportPreviewAction = useMemo(() => getReportPreviewAction(report?.chatReportID, report?.reportID), [report?.chatReportID, report?.reportID]);

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
        reportActionPages,
        transactionThreadReportID: thread.transactionThreadReportID,
        transactionThreadReport: thread.transactionThreadReport,
        parentReportActionForTransactionThread: thread.parentReportActionForTransactionThread,
        shouldAddCreatedAction,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
    };
}

export default useReportActionsPagination;
