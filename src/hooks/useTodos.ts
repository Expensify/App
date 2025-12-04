import {useMemo} from 'react';
import CONST from '@src/CONST';
import {canSubmitReport} from '@src/libs/actions/IOU';
import {isArchivedReport} from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import useOnyx from './useOnyx';

export default function useTodos() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const currentUserEmail = session?.email ?? '';

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: false});

    return useMemo(() => {
        const reportsToSubmit: string[] = [];
        const reportsToApprove: string[] = [];
        const reportsToPay: string[] = [];
        const reportsToExport: string[] = [];

        if (!allReports) {
            return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
        }

        // Build a map of reportID -> transactions for efficient lookup
        const transactionsByReportID: Record<string, Transaction[]> = {};
        if (allTransactions) {
            Object.values(allTransactions).forEach((transaction) => {
                if (!transaction?.reportID) {
                    return;
                }
                if (!transactionsByReportID[transaction.reportID]) {
                    transactionsByReportID[transaction.reportID] = [];
                }
                transactionsByReportID[transaction.reportID].push(transaction);
            });
        }

        Object.values(allReports).forEach((report) => {
            if (!report?.reportID || report.type !== CONST.REPORT.TYPE.EXPENSE) {
                return;
            }

            const policy = report.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] : undefined;
            const reportTransactions = transactionsByReportID[report.reportID] ?? [];
            const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];
            const isReportArchivedFlag = isArchivedReport(reportNameValuePairs);

            if (canSubmitReport(report, policy, reportTransactions, allTransactionViolations, isReportArchivedFlag, currentUserEmail)) {
                reportsToSubmit.push(report.reportID);
            }
        });

        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
    }, [allReports, allPolicies, allReportNameValuePairs, allTransactions, allTransactionViolations, currentUserEmail]);
}
