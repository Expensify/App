import {useMemo} from 'react';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from '@libs/ReportPrimaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

export default function useTodos() {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const {login = '', accountID} = useCurrentUserPersonalDetails();

    return useMemo(() => {
        const reportsToSubmit: Report[] = [];
        const reportsToApprove: Report[] = [];
        const reportsToPay: Report[] = [];
        const reportsToExport: Report[] = [];

        const reports = allReports ? Object.values(allReports) : [];
        if (reports.length === 0) {
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

        for (const report of reports) {
            if (!report?.reportID || report.type !== CONST.REPORT.TYPE.EXPENSE) {
                continue;
            }
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
            const reportNameValuePair = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`];
            const reportActions = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`] ?? []);
            const reportTransactions = transactionsByReportID[report.reportID] ?? [];

            if (isSubmitAction(report, reportTransactions, policy, reportNameValuePair)) {
                reportsToSubmit.push(report);
            }
            if (isApproveAction(report, reportTransactions, policy)) {
                reportsToApprove.push(report);
            }
            if (isPrimaryPayAction(report, accountID, login, bankAccountList, policy, reportNameValuePair)) {
                reportsToPay.push(report);
            }
            if (isExportAction(report, login, policy, reportActions)) {
                reportsToExport.push(report);
            }
        }

        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
    }, [allReports, allTransactions, allPolicies, allReportNameValuePairs, allReportActions, accountID, login, bankAccountList]);
}
