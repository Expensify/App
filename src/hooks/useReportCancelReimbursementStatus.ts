import {hasDailyNachaCutoffPassed} from '@libs/ReportSecondaryActionUtils';
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
    // Auth only allows cancelling in BILLING + REIMBURSED, so there is nothing to ask about in any other state.
    const isReimbursementSubmitted = isExpenseReport(report) && report?.stateNum === CONST.REPORT.STATE_NUM.BILLING && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    // Past the cutoff the batch has left, so the answer is already known and there is nothing to ask.
    const isStillCancellable = isReimbursementSubmitted && !!report?.reportID && !hasDailyNachaCutoffPassed(report.reportID);
    const reportIDToFetch = isStillCancellable && !isOffline ? report?.reportID : undefined;
    const [fetchedStatus, setFetchedStatus] = useState<{reportID: string; status: ReportCancelReimbursementStatus | undefined}>();

    useEffect(() => {
        if (!reportIDToFetch) {
            return;
        }

        let isCurrentRequest = true;
        getReportCancelReimbursementStatus(reportIDToFetch).then((status) => {
            // A late response for an abandoned report would clobber the current one.
            if (!isCurrentRequest) {
                return;
            }
            setFetchedStatus({reportID: reportIDToFetch, status});
        });

        return () => {
            isCurrentRequest = false;
        };
    }, [reportIDToFetch]);

    return fetchedStatus?.reportID === reportIDToFetch ? fetchedStatus?.status : undefined;
}
