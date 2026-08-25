import {hasDailyNachaCutoffPassed} from '@libs/ReportSecondaryActionUtils';
import {isExpenseReport} from '@libs/ReportUtils';

import {getReportCancelReimbursementStatus} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import type {Report, ReportCancelReimbursementStatus} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

import useNetwork from './useNetwork';

export default function useReportCancelReimbursementStatus(report: OnyxEntry<Report>): ReportCancelReimbursementStatus | undefined {
    const {isOffline} = useNetwork();
    // Auth only allows cancelling in BILLING + REIMBURSED, so there is nothing to ask about in any other state.
    const isReimbursementSubmitted = isExpenseReport(report) && report?.stateNum === CONST.REPORT.STATE_NUM.BILLING && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    const reportIDToFetch = isReimbursementSubmitted && !isOffline ? report?.reportID : undefined;
    const [fetchedStatus, setFetchedStatus] = useState<ReportCancelReimbursementStatus | undefined>();

    useEffect(() => {
        if (!reportIDToFetch || hasDailyNachaCutoffPassed(reportIDToFetch)) {
            return;
        }

        let isCurrentRequest = true;
        getReportCancelReimbursementStatus(reportIDToFetch)
            .then((status) => {
                if (!isCurrentRequest) {
                    return;
                }
                setFetchedStatus(status);
            })
            // Leaving the status unknown keeps the option hidden, same as being offline.
            .catch(() => {});

        return () => {
            isCurrentRequest = false;
            setFetchedStatus(undefined);
        };
    }, [reportIDToFetch]);

    return fetchedStatus;
}
