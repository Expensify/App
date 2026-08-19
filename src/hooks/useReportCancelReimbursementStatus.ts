import {isExpenseReport} from '@libs/ReportUtils';

import {getReportCancelReimbursementStatus} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import type {Report, ReportCancelReimbursementStatus} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useCallback, useEffect, useState} from 'react';

import useNetwork from './useNetwork';
import usePolling from './usePolling';

/** The answer is only valid for the state it was fetched for, so it is dropped when the report or the connection changes. */
export default function useReportCancelReimbursementStatus(report: OnyxEntry<Report>): ReportCancelReimbursementStatus | undefined {
    const {isOffline} = useNetwork();
    // Auth only allows cancelling in BILLING + REIMBURSED, so there is nothing to ask about in any other state.
    const isReimbursementSubmitted = isExpenseReport(report) && report?.stateNum === CONST.REPORT.STATE_NUM.BILLING && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const reportIDToFetch = isReimbursementSubmitted && !isOffline ? report?.reportID : undefined;
    const [fetchedStatus, setFetchedStatus] = useState<{reportID: string; status: ReportCancelReimbursementStatus | undefined}>();

    const fetchStatus = useCallback(() => {
        if (!reportIDToFetch) {
            return;
        }

        getReportCancelReimbursementStatus(reportIDToFetch).then((status) => {
            setFetchedStatus({reportID: reportIDToFetch, status});
        });
    }, [reportIDToFetch]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // The credit can post, or the NACHA cutoff can pass, while the report stays open, so re-check periodically instead of trusting the first answer.
    usePolling(fetchStatus, CONST.TIMING.CANCEL_REIMBURSEMENT_STATUS_POLL_INTERVAL, !!reportIDToFetch);

    return fetchedStatus?.reportID === reportIDToFetch ? fetchedStatus?.status : undefined;
}
