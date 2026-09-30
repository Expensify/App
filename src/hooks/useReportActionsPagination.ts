import {getReportPreviewReportAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCombinedReportActions, getFilteredReportActionsForReportView, getSortedReportActionsForDisplay, isCreatedAction} from '@libs/ReportActionsUtils';
import {isConciergeChatReport, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread as isReportTransactionThreadUtil, shouldReportAlignToTop} from '@libs/ReportUtils';

import getReportActionsToDisplay from '@pages/inbox/report/getReportActionsToDisplay';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useMemo, useState} from 'react';

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
    const isConciergeChat = isConciergeChatReport(report, conciergeReportID);

    const shouldBeAlignedToTop = shouldReportAlignToTop(report, parentReportAction);

    const {
        reportActions: unfilteredReportActions,
        hasOlderActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
        isLinkedActionInMergedTransactionThread,
        linkedActionTransactionThreadReportID,
    } = usePaginatedReportActions(reportID, reportActionIDFromRoute, {
        shouldLinkToOldestUnreadReportAction: !shouldBeAlignedToTop,
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
    const reportPreviewAction = useMemo(
        () => getReportPreviewReportAction(report?.chatReportID, report?.reportID, chatReportActions),
        [report?.chatReportID, report?.reportID, chatReportActions],
    );

    // useTransactionThread resolves the thread from the paginated window, so it comes back empty when the IOU action sits in an older page.
    const fallbackThreadReportID = !thread.transactionThreadReportID && isLinkedActionInMergedTransactionThread ? linkedActionTransactionThreadReportID : undefined;
    const [fallbackThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(fallbackThreadReportID)}`);
    const [fallbackThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(fallbackThreadReportID)}`, {
        selector: (actions: OnyxEntry<ReportActions>) => getSortedReportActionsForDisplay(actions, true, true, undefined, fallbackThreadReportID),
    });

    const transactionThreadReportID = thread.transactionThreadReportID ?? fallbackThreadReportID;
    const transactionThreadReport = thread.transactionThreadReport ?? fallbackThreadReport;
    const transactionThreadReportActions = thread.transactionThreadReportID ? (thread.transactionThreadReportActions ?? []) : (fallbackThreadReportActions ?? []);

    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    const reportActionsToDisplay = useMemo(
        () => getReportActionsToDisplay(allReportActions, lastAction, report, reportPreviewAction, transactionThreadReport, shouldAddCreatedAction, getCurrencyDecimals, delegateAccountID),
        [allReportActions, lastAction, report, reportPreviewAction, shouldAddCreatedAction, transactionThreadReport, getCurrencyDecimals, delegateAccountID],
    );

    const reportActions = useMemo(
        () => (reportActionsToDisplay ? getCombinedReportActions(reportActionsToDisplay, transactionThreadReportID ?? null, transactionThreadReportActions) : []),
        [reportActionsToDisplay, transactionThreadReportActions, transactionThreadReportID],
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
        transactionThreadReportID,
        transactionThreadReport,
        parentReportActionForTransactionThread: thread.parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
        reportPreviewAction,
    };
}

export default useReportActionsPagination;
