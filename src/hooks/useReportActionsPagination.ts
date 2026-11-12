import {getReportPreviewReportAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCombinedReportActions, getFilteredReportActionsForReportView, isCreatedAction} from '@libs/ReportActionsUtils';
import {isConciergeChatReport, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread as isReportTransactionThreadUtil, shouldReportAlignToTop} from '@libs/ReportUtils';

import getReportActionsToDisplay, {buildPlaceholderCreatedAction, buildPlaceholderExpenseAction} from '@pages/inbox/report/getReportActionsToDisplay';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

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
    /** Every action of the report in the Onyx cache, newest first, including hidden ones. */
    cachedActions: ReportAction[] | undefined;

    /** The report's own actions in the loaded window, without deleted expenses and hidden report previews. */
    reportViewActions: ReportAction[];

    /** IDs of `reportViewActions`. They tell the report's own actions apart from its one-expense thread's in `combinedActions`. */
    reportViewActionIDs: string[];

    /** `reportViewActions` merged with the one-expense thread's actions, plus placeholder rows while the report loads. */
    combinedActions: ReportAction[];

    /** IDs of the stored actions in `combinedActions`, so without placeholders. */
    persistedReportActionIDs: string[];
    hasOlderActions: boolean;
    hasNewerActions: boolean;
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
    const isConciergeChat = isConciergeChatReport(report, conciergeReportID);

    const {windowActions, hasOlderActions, hasNewerActions, cachedActions, oldestUnreadReportAction} = usePaginatedReportActions(reportID, reportActionIDFromRoute, {
        shouldLinkToOldestUnreadReportAction: !shouldBeAlignedToTop,
        treatAsNoPaginationAnchor,
        // Scope the first-defined lastReadTime snapshot to Concierge so the cold-open unread anchor resolves
        // (https://github.com/Expensify/App/issues/93196) without changing regular inbox chat pagination.
        shouldSnapshotInitialLastReadTime: isConciergeChat,
    });
    const thread = useTransactionThread({reportID, report, reportViewActions: getFilteredReportActionsForReportView(windowActions), isOffline});

    const [chatReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.chatReportID)}`);
    const reportPreviewAction = getReportPreviewReportAction(report?.chatReportID, report?.reportID, chatReportActions);

    // Only these report fields feed the arrays. Passing them on their own keeps a write to any other field, like
    // lastReadTime, from rebuilding the arrays and re-rendering the list.
    const isReportMoneyRequest = isMoneyRequestReport(report);
    const {reportViewActions, reportViewActionIDs, combinedActions, persistedReportActionIDs} = useCombinedReportActions({
        windowActions,
        reportID,
        ownerAccountID: report?.ownerAccountID,
        reportTotal: report?.total,
        isMoneyRequestReport: isReportMoneyRequest,
        canHavePlaceholderCreatedAction: isReportMoneyRequest || isInvoiceReport(report) || isReportTransactionThreadUtil(report) || isConciergeChat,
        reportPreviewAction,
        transactionThreadReportID: thread.transactionThreadReportID,
        transactionThreadReport: thread.transactionThreadReport,
        transactionThreadReportActions: thread.transactionThreadReportActions,
    });

    return {
        cachedActions,
        reportViewActions,
        reportViewActionIDs,
        combinedActions,
        persistedReportActionIDs,
        hasOlderActions,
        hasNewerActions,
        oldestUnreadReportAction,
        transactionThreadReportID: thread.transactionThreadReportID,
        transactionThreadReport: thread.transactionThreadReport,
        parentReportActionForTransactionThread: thread.parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
        reportPreviewAction,
    };
}

type UseCombinedReportActionsParams = {
    windowActions: ReportAction[];
    reportID: string | undefined;
    ownerAccountID: number | undefined;
    reportTotal: number | undefined;
    isMoneyRequestReport: boolean;
    canHavePlaceholderCreatedAction: boolean;
    reportPreviewAction: ReturnType<typeof getReportPreviewReportAction>;
    transactionThreadReportID: string | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    transactionThreadReportActions: ReportAction[] | undefined;
};

/** Builds `reportViewActions` and `combinedActions` from primitive and stable inputs only, so React Compiler keeps them until one of those changes. */
function useCombinedReportActions({
    windowActions,
    reportID,
    ownerAccountID,
    reportTotal,
    isMoneyRequestReport: isReportMoneyRequest,
    canHavePlaceholderCreatedAction,
    reportPreviewAction,
    transactionThreadReportID,
    transactionThreadReport,
    transactionThreadReportActions,
}: UseCombinedReportActionsParams) {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();

    const reportViewActions = getFilteredReportActionsForReportView(windowActions);
    const oldestAction = reportViewActions.at(-1);
    const shouldAddCreatedAction = canHavePlaceholderCreatedAction && !isCreatedAction(oldestAction);

    // Built from fields a new message doesn't change, so the placeholder rows keep their identity while the user chats.
    const placeholderCreatedAction = shouldAddCreatedAction ? buildPlaceholderCreatedAction(ownerAccountID, oldestAction?.created) : undefined;
    const placeholderExpenseAction =
        isReportMoneyRequest && !!reportTotal
            ? buildPlaceholderExpenseAction(reportID, (placeholderCreatedAction ?? oldestAction)?.created, delegateAccountID, getCurrencyDecimals)
            : undefined;

    const reportActionsToDisplay = getReportActionsToDisplay({
        reportViewActions,
        isMoneyRequestReport: isReportMoneyRequest,
        reportPreviewAction,
        transactionThreadReport,
        placeholderCreatedAction,
        placeholderExpenseAction,
    });
    const combinedActions = getCombinedReportActions(reportActionsToDisplay, transactionThreadReportID ?? null, transactionThreadReportActions ?? []);

    const reportViewActionIDs = reportViewActions.map((action) => action.reportActionID);
    // A one-expense report shows the comments of its transaction thread. Onyx stores those comments under the
    // reportID of the thread, therefore reportViewActionIDs does not contain them.
    const persistedReportActionIDs = [...reportViewActionIDs, ...(transactionThreadReportActions ?? []).map((action) => action.reportActionID)];

    return {reportViewActions, reportViewActionIDs, combinedActions, persistedReportActionIDs};
}

export default useReportActionsPagination;
