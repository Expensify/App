import React from 'react';

import type {CaseID} from './types';

import ReportDetailsDeleteAction from './ReportDetailsDeleteAction';
import ReportDetailsMenuItems from './ReportDetailsMenuItems';
import useReportDetailsRequestData from './useReportDetailsRequestData';

type ReportDetailsRequestActionsProps = {
    reportID: string;
    caseID: CaseID;
};

/** Menu and Delete row of the money cases, the only place the request data subscriptions are mounted */
function ReportDetailsRequestActions({reportID, caseID}: ReportDetailsRequestActionsProps) {
    const requestData = useReportDetailsRequestData(reportID);
    const {shouldShowDeleteButton} = requestData;

    return (
        <>
            <ReportDetailsMenuItems
                reportID={reportID}
                requestData={requestData}
            />

            {shouldShowDeleteButton && (
                <ReportDetailsDeleteAction
                    reportID={reportID}
                    caseID={caseID}
                    requestData={requestData}
                />
            )}
        </>
    );
}

export default ReportDetailsRequestActions;
