import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getOneTransactionThreadReportID, getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';
import useReportTransactionsCollection from './useReportTransactionsCollection';

type UseTransactionThreadParams = {
    reportID: string | undefined;
    report: OnyxEntry<Report>;

    /** The report's own actions in the loaded window, without deleted expenses and hidden report previews. */
    reportViewActions: ReportAction[];
    isOffline: boolean;
};

type UseTransactionThreadResult = {
    transactionThreadReportID: string | undefined;
    transactionThreadReportActions: ReportAction[] | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    parentReportActionForTransactionThread: ReportAction | undefined;
};

/** Sorts the thread's stored actions, hidden ones included, sharing the sort with every other reader of the same Onyx value. */
function selectTransactionThreadReportActions(reportActions: OnyxEntry<ReportActions>): ReportAction[] {
    return getSortedReportActionsForDisplay(reportActions, undefined, true);
}

function useTransactionThread({reportID, report, reportViewActions, isOffline}: UseTransactionThreadParams): UseTransactionThreadResult {
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);

    const allReportTransactions = useReportTransactionsCollection(reportID);

    const reportTransactionsForThreadID = getAllNonDeletedTransactions(allReportTransactions, reportViewActions, isOffline, true);

    const visibleTransactionsForThreadID = reportTransactionsForThreadID?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const reportTransactionIDsForThread = visibleTransactionsForThreadID?.map((t) => t.transactionID);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportViewActions, isOffline, reportTransactionIDsForThread);

    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {
        selector: selectTransactionThreadReportActions,
    });

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const parentReportActionForTransactionThread = isEmptyObject(transactionThreadReportActions)
        ? undefined
        : reportViewActions.find((action) => action.reportActionID === transactionThreadReport?.parentReportActionID);

    return {
        transactionThreadReportID,
        transactionThreadReportActions,
        transactionThreadReport,
        parentReportActionForTransactionThread,
    };
}

export default useTransactionThread;
