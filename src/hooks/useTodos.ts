import {useMemo} from 'react';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector} from '@src/selectors/Session';
import type {Report, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';
import { useSearchContext } from '@components/Search/SearchContext';
import {isArchivedReport} from '@libs/ReportUtils';

export default function useTodos() {
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: false});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: false});
    const {currentSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES} = useSearchContext();

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
            const reportTransactions = transactionsByReportID[report.reportID] ?? [];

            if (report.stateNum === CONST.REPORT.STATE_NUM.OPEN && report.statusNum === CONST.REPORT.STATUS_NUM.OPEN && report.ownerAccountID === currentUserAccountID) {
                reportsToSubmit.push(report);
            }

            if (report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED && policy?.type !== CONST.POLICY.TYPE.PERSONAL && policy?.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL && reportTransactions.length > 0 && !isArchivedReport(chatReportRNPV) && report.managerID === currentUserAccountID) {
                reportsToApprove.push(report);
            }
        }

        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
    }, [allReports, allTransactionViolations, currentUserAccountID, currentSearchKey]);
}
