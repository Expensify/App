import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from '@libs/ReportPrimaryActionUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy, Report, ReportActions, ReportMetadata, ReportNameValuePairs, Transaction} from '@src/types/onyx';

const createTodosReportsAndTransactions = ({
    allReports,
    allTransactions,
    allPolicies,
    allReportNameValuePairs,
    allReportActions,
    allReportMetadata,
    bankAccountList,
    currentUserAccountID,
    login,
}: {
    allReports: OnyxCollection<Report>;
    allTransactions: OnyxCollection<Transaction>;
    allPolicies: OnyxCollection<Policy>;
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    allReportActions: OnyxCollection<ReportActions>;
    allReportMetadata: OnyxCollection<ReportMetadata>;
    bankAccountList: OnyxEntry<BankAccountList>;
    currentUserAccountID: number;
    login: string;
}) => {
    const reportsToSubmit: Report[] = [];
    const reportsToApprove: Report[] = [];
    const reportsToPay: Report[] = [];
    const reportsToExport: Report[] = [];
    const transactionsByReportID: Record<string, Transaction[]> = {};

    const reports = allReports ? Object.values(allReports) : [];
    if (reports.length === 0) {
        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID};
    }

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
        const reportMetadata = allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`];

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

    return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID};
};

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.TODOS,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        ONYXKEYS.COLLECTION.REPORT_METADATA,
        ONYXKEYS.BANK_ACCOUNT_LIST,
        ONYXKEYS.SESSION,
    ],
    compute: ([allReports, allPolicies, allReportNameValuePairs, allTransactions, allReportActions, allReportMetadata, bankAccountList, session]) => {
        const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const login = session?.email ?? '';

        const {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID} = createTodosReportsAndTransactions({
            allReports,
            allTransactions,
            allPolicies,
            allReportNameValuePairs,
            allReportActions,
            allReportMetadata,
            bankAccountList,
            currentUserAccountID: userAccountID,
            login,
        });

        return {
            reportsToSubmit,
            reportsToApprove,
            reportsToPay,
            reportsToExport,
            transactionsByReportID,
        };
    },
});
