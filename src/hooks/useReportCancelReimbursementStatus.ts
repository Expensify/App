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
    const statusKey = isReimbursementSubmitted && !isOffline ? report?.reportID : undefined;
    const [fetchedStatus, setFetchedStatus] = useState<{key: string; status: ReportCancelReimbursementStatus | undefined}>();

    useEffect(() => {
        if (!statusKey) {
            return;
        }

        let isCurrentRequest = true;
        getReportCancelReimbursementStatus(statusKey).then((status) => {
            if (!isCurrentRequest) {
                return;
            }
            setFetchedStatus({key: statusKey, status});
        });

        return () => {
            isCurrentRequest = false;
        };
    }, [statusKey]);

    return fetchedStatus?.key === statusKey ? fetchedStatus?.status : undefined;
}
