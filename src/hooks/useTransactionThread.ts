import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getOneTransactionThreadReportID, getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, isReportTransactionThread as isReportTransactionThreadUtil} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';
import useReportTransactionsCollection from './useReportTransactionsCollection';

type UseTransactionThreadParams = {
    reportID: string | undefined;
    report: OnyxEntry<Report>;
    allReportActions: ReportAction[];
    isOffline: boolean;
};

type UseTransactionThreadResult = {
    isReportTransactionThread: boolean;
    transactionThreadReportID: string | undefined;
    transactionThreadReportActions: ReportAction[] | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    parentReportActionForTransactionThread: ReportAction | undefined;
};

function selectTransactionThreadReportActions(
    canPerformWriteAction: boolean,
    transactionThreadReportID: string | undefined,
    reportActions: OnyxEntry<ReportActions> | undefined,
): ReportAction[] {
    return getSortedReportActionsForDisplay(reportActions, canPerformWriteAction, true, undefined, transactionThreadReportID ?? undefined);
}

function useTransactionThread({reportID, report, allReportActions, isOffline}: UseTransactionThreadParams): UseTransactionThreadResult {
    const isReportTransactionThread = isReportTransactionThreadUtil(report);

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);

    const allReportTransactions = useReportTransactionsCollection(reportID);

    const reportTransactionsForThreadID = getAllNonDeletedTransactions(allReportTransactions, allReportActions ?? [], isOffline, true);

    const visibleTransactionsForThreadID = reportTransactionsForThreadID?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const reportTransactionIDsForThread = visibleTransactionsForThreadID?.map((t) => t.transactionID);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, allReportActions ?? [], isOffline, reportTransactionIDsForThread);

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);

    const getTransactionThreadReportActions = useCallback(
        (reportActions: OnyxEntry<ReportActions>): ReportAction[] => selectTransactionThreadReportActions(canPerformWriteAction, transactionThreadReportID, reportActions),
        [canPerformWriteAction, transactionThreadReportID],
    );

    const [transactionThreadReportActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        {
            selector: getTransactionThreadReportActions,
        },
        [getTransactionThreadReportActions],
    );

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const parentReportActionForTransactionThread = isEmptyObject(transactionThreadReportActions)
        ? undefined
        : allReportActions?.find((action) => action.reportActionID === transactionThreadReport?.parentReportActionID);

    return {
        isReportTransactionThread,
        transactionThreadReportID,
        transactionThreadReportActions,
        transactionThreadReport,
        parentReportActionForTransactionThread,
    };
}

export default useTransactionThread;
