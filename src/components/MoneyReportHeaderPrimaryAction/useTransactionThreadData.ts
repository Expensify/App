import useNetwork from '@hooks/useNetwork';
import useMoneyRequestReportPaginatedFilteredActions from '@hooks/useMoneyRequestReportPaginatedFilteredActions';
import useOnyx from '@hooks/useOnyx';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

function useTransactionThreadData(reportID: string | undefined, chatReportID: string | undefined) {
    const {isOffline} = useNetwork();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);

    const {reportActions} = useMoneyRequestReportPaginatedFilteredActions(reportID);
    const {transactionThreadReportID, transactionThreadReport} = useTransactionThreadReport(reportID, reportActions);

    const allReportTransactions = useReportTransactionsCollection(reportID);
    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const requestParentReportAction = (() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    })();

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);

    return {
        moneyRequestReport,
        chatReport,
        isOffline,
        reportActions,
        visibleTransactions,
        reportTransactionIDs,
        transactionThreadReportID,
        transactionThreadReport,
        requestParentReportAction,
        iouTransactionID,
        transaction,
    };
}

export default useTransactionThreadData;
