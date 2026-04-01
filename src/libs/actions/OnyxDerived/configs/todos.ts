import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from '@libs/ReportPrimaryActionUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, PersonalDetailsList, Policy, Report, ReportActions, ReportMetadata, ReportNameValuePairs, Transaction, TransactionViolations} from '@src/types/onyx';
import type {TodoCategorySearchData, TodoMetadata} from '@src/types/onyx/DerivedValues';

type CreateTodosReportsAndTransactionsParams = {
    allReports: OnyxCollection<Report>;
    allTransactions: OnyxCollection<Transaction>;
    allPolicies: OnyxCollection<Policy>;
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    allReportActions: OnyxCollection<ReportActions>;
    allReportMetadata: OnyxCollection<ReportMetadata>;
    bankAccountList: OnyxEntry<BankAccountList>;
    currentUserAccountID: number;
    login: string;
};

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
}: CreateTodosReportsAndTransactionsParams) => {
    const reportsToSubmit: Report[] = [];
    const reportsToApprove: Report[] = [];
    const reportsToPay: Report[] = [];
    const reportsToExport: Report[] = [];
    const transactionsByReportID: Record<string, Transaction[]> = {};

    const reports = Object.values(allReports ?? {});
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
        if (
            isPrimaryPayAction({
                report,
                reportTransactions,
                currentUserAccountID,
                currentUserLogin: login,
                bankAccountList,
                policy,
                reportNameValuePairs: reportNameValuePair,
            })
        ) {
            reportsToPay.push(report);
        }
        if (isExportAction(report, login, policy, reportActions) && policy?.exporter === login) {
            reportsToExport.push(report);
        }
    }

    return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID};
};

function computeMetadata(reports: Report[], transactionsByReportID: Record<string, Transaction[]>): TodoMetadata {
    let count = 0;
    let total = 0;
    let currency: string | undefined;

    for (const report of reports) {
        if (!report?.reportID) {
            continue;
        }

        const reportTransactions = transactionsByReportID[report.reportID];
        if (reportTransactions) {
            count += reportTransactions.length;

            for (const transaction of reportTransactions) {
                if (transaction.groupAmount) {
                    total -= transaction.groupAmount;
                }

                if (currency === undefined && transaction.groupCurrency) {
                    currency = transaction.groupCurrency;
                }
            }
        }
    }

    return {count, total, currency};
}

/**
 * Builds a SearchResults-compatible data object from the given reports and related data.
 * This allows the search UI to use live Onyx data instead of snapshot data when viewing to-do results.
 */
function buildSearchResultsData(
    reports: Report[],
    transactionsByReportID: Record<string, Transaction[]>,
    allPolicies: OnyxCollection<Policy>,
    allReportActions: OnyxCollection<ReportActions>,
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    transactionViolations: OnyxCollection<TransactionViolations>,
): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    for (const report of reports) {
        if (!report?.reportID) {
            continue;
        }
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;

        if (report.policyID && allPolicies) {
            const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`;
            if (allPolicies[policyKey] && !data[policyKey]) {
                data[policyKey] = allPolicies[policyKey];
            }
        }

        if (report.chatReportID && allReportNameValuePairs) {
            const nvpKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`;
            if (allReportNameValuePairs[nvpKey] && !data[nvpKey]) {
                data[nvpKey] = allReportNameValuePairs[nvpKey];
            }
        }

        if (allReportActions) {
            const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`;
            if (allReportActions[actionsKey] && !data[actionsKey]) {
                data[actionsKey] = allReportActions[actionsKey];
            }
        }

        const reportTransactions = transactionsByReportID[report.reportID];
        if (reportTransactions) {
            for (const transaction of reportTransactions) {
                const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                data[transactionKey] = transaction;

                if (transactionViolations) {
                    const violationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`;
                    if (transactionViolations[violationsKey]) {
                        data[violationsKey] = transactionViolations[violationsKey];
                    }
                }
            }
        }
    }

    if (personalDetails) {
        data[ONYXKEYS.PERSONAL_DETAILS_LIST] = personalDetails;
    }

    return data;
}

const emptySearchData: TodoCategorySearchData = {
    data: {},
    metadata: {count: 0, total: 0, currency: undefined},
};

function buildCategorySearchData(
    reports: Report[],
    transactionsByReportID: Record<string, Transaction[]>,
    allPolicies: OnyxCollection<Policy>,
    allReportActions: OnyxCollection<ReportActions>,
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    transactionViolations: OnyxCollection<TransactionViolations>,
): TodoCategorySearchData {
    if (!reports.length) {
        return emptySearchData;
    }

    return {
        metadata: computeMetadata(reports, transactionsByReportID),
        data: buildSearchResultsData(reports, transactionsByReportID, allPolicies, allReportActions, allReportNameValuePairs, personalDetails, transactionViolations),
    };
}

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
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    ],
    compute: ([
        allReports,
        allPolicies,
        allReportNameValuePairs,
        allTransactions,
        allReportActions,
        allReportMetadata,
        bankAccountList,
        session,
        personalDetailsList,
        allTransactionViolations,
    ]) => {
        const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const login = personalDetailsList?.[userAccountID]?.login ?? session?.email ?? '';

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

        const enrichmentArgs = [transactionsByReportID, allPolicies, allReportActions, allReportNameValuePairs, personalDetailsList, allTransactionViolations] as const;

        return {
            reportsToSubmit,
            reportsToApprove,
            reportsToPay,
            reportsToExport,
            transactionsByReportID,
            searchData: {
                submit: buildCategorySearchData(reportsToSubmit, ...enrichmentArgs),
                approve: buildCategorySearchData(reportsToApprove, ...enrichmentArgs),
                pay: buildCategorySearchData(reportsToPay, ...enrichmentArgs),
                export: buildCategorySearchData(reportsToExport, ...enrichmentArgs),
            },
        };
    },
});
