import {useMemo} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid using snapshots for live to-do data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from '@libs/ReportPrimaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

type ReportCounts = {
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: number;
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: number;
    [CONST.SEARCH.SEARCH_KEYS.PAY]: number;
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: number;
};

/**
 * Lightweight hook that calculates report counts for to-do badge displays.
 * This is extracted from useTodos to avoid expensive SearchResults data building
 * when only counts are needed (e.g., in navigation tab bars).
 *
 * For full to-do search results data, use useTodos instead.
 */
export default function useReportCounts(): ReportCounts {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false});
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA, {canBeMissing: false});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const {login = '', accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const reportCounts = useMemo(() => {
        const reportsToSubmit: Report[] = [];
        const reportsToApprove: Report[] = [];
        const reportsToPay: Report[] = [];
        const reportsToExport: Report[] = [];
        const transactionsByReportID: Record<string, Transaction[]> = {};

        const reports = allReports ? Object.values(allReports) : [];
        if (reports.length === 0) {
            return {
                [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 0,
                [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 0,
                [CONST.SEARCH.SEARCH_KEYS.PAY]: 0,
                [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 0,
            };
        }

        // Build transaction mapping for report checks
        if (allTransactions) {
            for (const transaction of Object.values(allTransactions)) {
                if (!transaction?.reportID) {
                    continue;
                }
                (transactionsByReportID[transaction.reportID] ??= []).push(transaction);
            }
        }

        // Categorize reports into to-do categories
        for (const report of reports) {
            if (!report?.reportID || report.type !== CONST.REPORT.TYPE.EXPENSE) {
                continue;
            }
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
            const reportNameValuePair = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`];
            const reportMetadata = allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`];
            const reportActions = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`] ?? []);
            const reportTransactions = transactionsByReportID[report.reportID] ?? [];

            if (isSubmitAction(report, reportTransactions, reportMetadata, policy, reportNameValuePair, undefined, login, currentUserAccountID)) {
                reportsToSubmit.push(report);
            }
            if (isApproveAction(report, reportTransactions, currentUserAccountID, reportMetadata, policy)) {
                reportsToApprove.push(report);
            }
            if (isPrimaryPayAction(report, currentUserAccountID, login, bankAccountList, policy, reportNameValuePair)) {
                reportsToPay.push(report);
            }
            if (isExportAction(report, login, policy, reportActions)) {
                reportsToExport.push(report);
            }
        }

        return {
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: reportsToSubmit.length,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: reportsToApprove.length,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: reportsToPay.length,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: reportsToExport.length,
        };
    }, [allReports, allTransactions, allPolicies, allReportNameValuePairs, allReportMetadata, allReportActions, currentUserAccountID, login, bankAccountList]);

    return reportCounts;
}
