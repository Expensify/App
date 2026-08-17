import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isExpenseReport} from '@libs/ReportUtils';

import {getReportCancelReimbursementStatus} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportCancelReimbursementStatus} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

/**
 * Fetches and subscribes to whether the backend can still cancel the report's bank reimbursement.
 * The status is refreshed whenever the report becomes reimbursed.
 */
export default function useReportCancelReimbursementStatus(report: OnyxEntry<Report>): OnyxEntry<ReportCancelReimbursementStatus> {
    const reportID = report?.reportID;
    const isReimbursedExpenseReport = isExpenseReport(report) && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const [reportCancelReimbursementStatus] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_CANCEL_REIMBURSEMENT_STATUS}${getNonEmptyStringOnyxID(reportID)}`);

    useEffect(() => {
        if (!reportID || !isReimbursedExpenseReport) {
            return;
        }
        getReportCancelReimbursementStatus(reportID);
    }, [reportID, isReimbursedExpenseReport]);

    return reportCancelReimbursementStatus;
}
