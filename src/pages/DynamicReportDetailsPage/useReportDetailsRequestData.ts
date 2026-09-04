import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportIsArchived from '@hooks/useReportIsArchived';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOneTransactionThreadReportID, getOriginalMessage, isDeletedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {CaseID} from './types';

import {CASES} from './types';

type UseReportDetailsRequestDataParams = {
    report: Report;
    parentReport: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
    caseID: CaseID;
};

type ReportDetailsRequestData = {
    /** The IOU action the page acts on: the parent action of a transaction thread, or the single IOU action of a one-transaction report */
    requestParentReportAction: OnyxEntry<ReportAction>;

    /** The report holding the money request (the parent report for a transaction thread, otherwise the report itself) */
    moneyRequestReport: OnyxEntry<Report>;
    moneyRequestReportActions: OnyxEntry<ReportActions>;
    isMoneyRequestReportArchived: boolean;

    iouTransactionID: string | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    iouOriginalTransaction: OnyxEntry<Transaction>;

    /** Whether the current user created the request action */
    isActionOwner: boolean;
    isDeletedParentAction: boolean;

    /** All actions of the report, used to resolve the original report of a tracked expense and to delete tasks */
    reportActionsForOriginalReportID: OnyxEntry<ReportActions>;

    /** The report from which a tracked expense would be submitted/categorized/shared, and its actions */
    actionReportID: string | undefined;
    actionReportActions: OnyxEntry<ReportActions>;
};

/**
 * Resolves the transaction-related data (request action, money request report, IOU transaction) the details page
 * menu items and delete action operate on. Kept out of the page so that report action updates only re-render the
 * action rows.
 */
function useReportDetailsRequestData({report, parentReport, parentReportAction, caseID}: UseReportDetailsRequestDataParams): ReportDetailsRequestData {
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`);
    const {reportActions} = usePaginatedReportActions(report.reportID);
    const [reportActionsForOriginalReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`);
    // createDraftTransactionAndNavigateToParticipantSelector uses the original report and its actions to find the linked track-expense action
    const actionReportID = getOriginalReportID(report.reportID, parentReportAction, reportActionsForOriginalReportID);
    const [actionReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${actionReportID}`);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);

    let requestParentReportAction: OnyxEntry<ReportAction> = parentReportAction;
    if (caseID === CASES.MONEY_REPORT) {
        requestParentReportAction =
            reportActions && transactionThreadReport?.parentReportActionID
                ? reportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID)
                : undefined;
    }

    const moneyRequestReport: OnyxEntry<Report> = caseID === CASES.MONEY_REQUEST ? parentReport : report;
    const isMoneyRequestReportArchived = useReportIsArchived(moneyRequestReport?.reportID);
    const [moneyRequestReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [iouTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const [iouOriginalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransaction?.comment?.originalTransactionID)}`);

    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' &&
        typeof currentUserPersonalDetails?.accountID === 'number' &&
        requestParentReportAction.actorAccountID === currentUserPersonalDetails?.accountID;
    const isDeletedParentAction = isDeletedAction(requestParentReportAction);

    return {
        requestParentReportAction,
        moneyRequestReport,
        moneyRequestReportActions,
        isMoneyRequestReportArchived,
        iouTransactionID,
        iouTransaction,
        iouOriginalTransaction,
        isActionOwner,
        isDeletedParentAction,
        reportActionsForOriginalReportID,
        actionReportID,
        actionReportActions,
    };
}

export default useReportDetailsRequestData;
export type {ReportDetailsRequestData};
