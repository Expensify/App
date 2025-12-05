import {useMemo} from 'react';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector, emailSelector} from '@src/selectors/Session';
import type {Report, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';
import {isSubmitAction, isApproveAction, isPrimaryPayAction, isExportAction} from '@libs/ReportPrimaryActionUtils';

export default function useTodos() {
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: false});
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: false});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});

    return useMemo(() => {
        const reportsToSubmit: Report[] = [];
        const reportsToApprove: Report[] = [];
        const reportsToPay: Report[] = [];
        const reportsToExport: Report[] = [];

        if (!allReports) {
            return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
        }

        const transactionsByReportID: Record<string, Transaction[]> = {};
        if (allTransactions) {
            for (const transaction of Object.values(allTransactions)) {
                if (!transaction?.reportID) {
                    continue;
                }
                (transactionsByReportID[transaction.reportID] ??= []).push(transaction);
            }
        }

        for (const report of Object.values(allReports)) {
            if (!report?.reportID || report.type !== CONST.REPORT.TYPE.EXPENSE) {
                continue;
            }
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
            const chatReportRNPV = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`];
            const reportActions = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`] ?? []);
            const reportTransactions = transactionsByReportID[report.reportID] ?? [];

            if (isSubmitAction(report, reportTransactions, policy, chatReportRNPV)) {
                reportsToSubmit.push(report);
            }
            if (isApproveAction(report, reportTransactions, policy)) {
                reportsToApprove.push(report);
            }
            if (isPrimaryPayAction(report, policy, chatReportRNPV)) {
                reportsToPay.push(report);
            }
            if (isExportAction(report, policy, reportActions)) {
                reportsToExport.push(report);
            }
        }

        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
    }, [allReports, allPolicies, allReportNameValuePairs, allTransactions, currentUserAccountID, currentUserEmail]);
}
