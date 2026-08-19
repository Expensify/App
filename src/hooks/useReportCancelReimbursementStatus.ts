import {isExpenseReport} from '@libs/ReportUtils';

import {getReportCancelReimbursementStatus} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import type {Report, ReportCancelReimbursementStatus} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

import useNetwork from './useNetwork';

/** The answer is only valid for the state it was fetched for, so it is dropped when the report or the connection changes. */
export default function useReportCancelReimbursementStatus(report: OnyxEntry<Report>): ReportCancelReimbursementStatus | undefined {
    const {isOffline} = useNetwork();
const reportID = report?.reportID;
    // Auth only allows cancelling in BILLING + REIMBURSED, so there is nothing to ask about in any other state.
    const isReimbursementSubmitted = isExpenseReport(report) && report?.stateNum === CONST.REPORT.STATE_NUM.BILLING && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const [reportCancelReimbursementStatus, setReportCancelReimbursementStatus] = useState<ReportCancelReimbursementStatus | undefined>();
    const shouldFetchStatus = !isOffline && !!reportID && isReimbursementSubmitted;

    useEffect(() => {
        if (!shouldFetchStatus) {
            return;
        }

        let isCurrentRequest = true;
        getReportCancelReimbursementStatus(reportID).then((status) => {
            if (!isCurrentRequest) {
                setReportCancelReimbursementStatus(undefined);
                return;
            }
            setReportCancelReimbursementStatus(status);
        });

        return () => {
            isCurrentRequest = false;
        };
    }, [shouldFetchStatus, reportID]);

    if (!shouldFetchStatus) {
        return;
    }

    return reportCancelReimbursementStatus;
}
