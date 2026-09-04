import type {Policy, Report, ReportAction, ReportMetadata} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {CaseID} from './types';

import ReportDetailsDeleteAction from './ReportDetailsDeleteAction';
import ReportDetailsMenuItems from './ReportDetailsMenuItems';
import useReportDetailsRequestData from './useReportDetailsRequestData';

type ReportDetailsActionsProps = {
    report: Report;
    policy: OnyxEntry<Policy>;
    parentReport: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
    reportMetadata: OnyxEntry<ReportMetadata>;
    caseID: CaseID;
    reportIDFromRoute: string;
};

/**
 * Menu rows and the delete row. Both act on the same request data (IOU action, transaction, money request report),
 * so it is resolved once here and passed down.
 */
function ReportDetailsActions({report, policy, parentReport, parentReportAction, reportMetadata, caseID, reportIDFromRoute}: ReportDetailsActionsProps) {
    const {
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
    } = useReportDetailsRequestData({report, parentReport, parentReportAction, caseID});

    return (
        <>
            <ReportDetailsMenuItems
                report={report}
                policy={policy}
                parentReport={parentReport}
                parentReportAction={parentReportAction}
                reportMetadata={reportMetadata}
                isDeletedParentAction={isDeletedParentAction}
                iouTransactionID={iouTransactionID}
                iouTransaction={iouTransaction}
                iouOriginalTransaction={iouOriginalTransaction}
                moneyRequestReportID={moneyRequestReport?.reportID}
                moneyRequestReportActions={moneyRequestReportActions}
                actionReportID={actionReportID}
                actionReportActions={actionReportActions}
            />
            <ReportDetailsDeleteAction
                report={report}
                policy={policy}
                parentReport={parentReport}
                parentReportAction={parentReportAction}
                caseID={caseID}
                reportIDFromRoute={reportIDFromRoute}
                requestParentReportAction={requestParentReportAction}
                moneyRequestReport={moneyRequestReport}
                moneyRequestReportActions={moneyRequestReportActions}
                isMoneyRequestReportArchived={isMoneyRequestReportArchived}
                iouTransactionID={iouTransactionID}
                iouTransaction={iouTransaction}
                iouOriginalTransaction={iouOriginalTransaction}
                isActionOwner={isActionOwner}
                isDeletedParentAction={isDeletedParentAction}
                reportActionsForOriginalReportID={reportActionsForOriginalReportID}
            />
        </>
    );
}

export default ReportDetailsActions;
