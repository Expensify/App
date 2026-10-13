import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';

import {
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isTrackExpenseReportNew as isTrackExpenseReportUtil,
} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import getReportDetailsCaseID from './getReportDetailsCaseID';
import ReportDetailsMenuItems from './ReportDetailsMenuItems';
import ReportDetailsRequestActions from './ReportDetailsRequestActions';
import ReportDetailsTaskDeleteAction from './ReportDetailsTaskDeleteAction';
import {CASES} from './types';

type ReportDetailsActionsProps = {
    reportID: string;
};

/** Gates the money request subscriptions behind the caseID, so chats, rooms and tasks never mount them */
function ReportDetailsActions({reportID}: ReportDetailsActionsProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const parentReportAction = useParentReportAction(report);
    const caseID = getReportDetailsCaseID({
        isMoneyRequestReport: isMoneyRequestReportUtil(report),
        isInvoiceReport: isInvoiceReportUtil(report),
        isMoneyRequest: isMoneyRequestUtil(report),
        isTrackExpenseReport: isTrackExpenseReportUtil(report, parentReport, parentReportAction),
    });

    if (caseID === CASES.DEFAULT) {
        return (
            <>
                <ReportDetailsMenuItems reportID={reportID} />
                <ReportDetailsTaskDeleteAction
                    reportID={reportID}
                    caseID={caseID}
                />
            </>
        );
    }

    return (
        <ReportDetailsRequestActions
            reportID={reportID}
            caseID={caseID}
        />
    );
}

export default ReportDetailsActions;
