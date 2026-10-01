import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOneTransactionThreadReportID, getOriginalMessage, isDeletedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canWriteInReport,
    isCanceledTaskReport as isCanceledTaskReportUtil,
    isClosedReport,
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isSelfDM as isSelfDMUtil,
    isTaskReport as isTaskReportUtil,
    isTrackExpenseReportNew as isTrackExpenseReportUtil,
} from '@libs/ReportUtils';
import {isDemoTransaction} from '@libs/TransactionUtils';

import {canActionTask, canModifyTask} from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {ReportDetailsRequestData} from './types';

import getReportDetailsCaseID from './getReportDetailsCaseID';
import {CASES} from './types';

/** Reads the money-request subscriptions of the details page. Only called behind the caseID gate, so a chat, room or task never mounts them. */
function useReportDetailsRequestData(reportID: string): ReportDetailsRequestData {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const parentReportAction = useParentReportAction(report);
    const {reportActions} = usePaginatedReportActions(reportID);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const isMoneyRequestReport = isMoneyRequestReportUtil(report);
    const isMoneyRequest = isMoneyRequestUtil(report);
    const isInvoiceReport = isInvoiceReportUtil(report);
    const isTaskReport = isTaskReportUtil(report);
    const isTrackExpenseReport = isTrackExpenseReportUtil(report, parentReport, parentReportAction);
    const isCanceledTaskReport = isCanceledTaskReportUtil(report, parentReportAction);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const isTaskModifiable = canModifyTask(report, currentUserAccountID, isParentReportArchived);
    const isTaskActionable = canActionTask(report, parentReportAction, currentUserAccountID, parentReport, isParentReportArchived);
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isSelfDMTrackExpenseReport = isTrackExpenseReport && isSelfDMUtil(parentReport);

    const caseID = getReportDetailsCaseID({isMoneyRequestReport, isInvoiceReport, isMoneyRequest, isTrackExpenseReport});

    const transactionThreadParentReportActionID = transactionThreadReport?.parentReportActionID;
    // Without an ID to match, the scan can only ever miss, so skip it rather than walking every action.
    const transactionThreadParentReportAction = transactionThreadParentReportActionID
        ? reportActions?.find((action) => action.reportActionID === transactionThreadParentReportActionID)
        : undefined;
    const requestParentReportAction = caseID === CASES.MONEY_REPORT ? transactionThreadParentReportAction : parentReportAction;
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(requestParentReportAction);
    const [iouPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const iouReportTransactionsCollection = useReportTransactionsCollection(iouReport?.reportID);
    const iouReportTransactions = Object.values(iouReportTransactionsCollection);
    const [requestParentReportActionChildReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(requestParentReportAction?.childReportID)}`);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(requestParentReportAction?.childReportID)}`);

    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' && typeof currentUserAccountID === 'number' && requestParentReportAction.actorAccountID === currentUserAccountID;
    const isDeletedParentAction = isDeletedAction(requestParentReportAction);

    const moneyRequestReport: OnyxEntry<OnyxTypes.Report> = caseID === CASES.MONEY_REQUEST ? parentReport : report;
    const isMoneyRequestReportArchived = useReportIsArchived(moneyRequestReport?.reportID);
    const [moneyRequestReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);

    const shouldShowTaskDeleteButton =
        isTaskReport &&
        !isCanceledTaskReport &&
        canWriteInReport(report) &&
        report?.stateNum !== CONST.REPORT.STATE_NUM.APPROVED &&
        !isClosedReport(report) &&
        isTaskModifiable &&
        isTaskActionable;
    const canDeleteRequest = isActionOwner && (canDeleteTransaction(moneyRequestReport, rules, isMoneyRequestReportArchived) || isSelfDMTrackExpenseReport) && !isDeletedParentAction;
    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [iouTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const [iouOriginalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransaction?.comment?.originalTransactionID)}`);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(iouTransactionID ? [iouTransactionID] : []);
    const {deleteTransactions, shouldOpenSplitExpenseEditFlowOnDelete} = useDeleteTransactions({
        report: parentReport,
        reportActions: requestParentReportAction ? [requestParentReportAction] : [],
        policy,
    });
    const isCardTransactionCanBeDeleted = canDeleteCardTransactionByLiabilityType(iouTransaction);
    const shouldShowDeleteButton = shouldShowTaskDeleteButton || (canDeleteRequest && isCardTransactionCanBeDeleted) || isDemoTransaction(iouTransaction);
    const shouldShowEditSplitOnDeleteAction = iouTransactionID ? shouldOpenSplitExpenseEditFlowOnDelete([iouTransactionID]) : false;
    let deleteMenuItemTitle = translate('reportActionContextMenu.deleteAction', requestParentReportAction);
    if (shouldShowEditSplitOnDeleteAction) {
        deleteMenuItemTitle = translate('iou.editSplits');
    } else if (caseID === CASES.DEFAULT) {
        deleteMenuItemTitle = translate('common.delete');
    }

    return {
        requestParentReportAction,
        iouReport,
        chatIOUReport,
        isChatIOUReportArchived,
        iouPolicy,
        iouReportTransactions,
        requestParentReportActionChildReport,
        transactionThreadReportActions,
        isDeletedParentAction,
        moneyRequestReport,
        isMoneyRequestReportArchived,
        moneyRequestReportActions,
        iouTransactionID,
        iouTransaction,
        iouOriginalTransaction,
        duplicateTransactions,
        duplicateTransactionViolations,
        deleteTransactions,
        shouldOpenSplitExpenseEditFlowOnDelete,
        isSingleTransactionView,
        shouldShowDeleteButton,
        shouldShowEditSplitOnDeleteAction,
        deleteMenuItemTitle,
    };
}

export default useReportDetailsRequestData;
