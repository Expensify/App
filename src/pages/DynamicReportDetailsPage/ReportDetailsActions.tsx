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

import type {ReportDetailsRequestData} from './types';

import getReportDetailsCaseID from './getReportDetailsCaseID';
import ReportDetailsRequestActions from './ReportDetailsRequestActions';
import ReportDetailsTaskDeleteAction from './ReportDetailsTaskDeleteAction';
import {CASES} from './types';

type ReportDetailsActionsProps = {
    reportID: string;

    /** Renders the menu rows. The request data is only passed for the money cases. */
    renderMenu: (requestData?: ReportDetailsRequestData) => React.ReactNode;

    /** Confirms the delete, navigates away and then runs the passed delete */
    showDeleteModal: (requestData: ReportDetailsRequestData | undefined, onDelete: () => void) => Promise<void>;

    /** Deletes the expense described by the request data */
    deleteTransaction: (requestData: ReportDetailsRequestData) => void;
};

/** Gates the money request subscriptions behind the caseID, so chats, rooms and tasks never mount them */
function ReportDetailsActions({reportID, renderMenu, showDeleteModal, deleteTransaction}: ReportDetailsActionsProps) {
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
                {renderMenu()}
                <ReportDetailsTaskDeleteAction
                    reportID={reportID}
                    showDeleteModal={showDeleteModal}
                />
            </>
        );
    }

    return (
        <ReportDetailsRequestActions
            reportID={reportID}
            renderMenu={renderMenu}
            showDeleteModal={showDeleteModal}
            deleteTransaction={deleteTransaction}
        />
    );
}

export default ReportDetailsActions;
