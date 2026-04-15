import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {EXPORT_RELEVANT_ACTION_TYPES} from '@libs/ReportActionsUtils';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from '@libs/ReportPrimaryActionUtils';
import {hasOnlyNonReimbursableTransactions} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy, Report, ReportActions, ReportMetadata, ReportNameValuePairs, Transaction} from '@src/types/onyx';

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
            }) &&
            !hasOnlyNonReimbursableTransactions(report.reportID, reportTransactions)
        ) {
            reportsToPay.push(report);
        }
        if (isExportAction(report, login, policy, reportActions) && policy?.exporter === login) {
            reportsToExport.push(report);
        }
    }

    return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID};
};

// Previous snapshots used to diff and find only new/changed data
let prevReportActions: OnyxCollection<ReportActions>;
let prevReports: OnyxCollection<Report>;
let prevReportMetadata: OnyxCollection<ReportMetadata>;

// Report fields that affect todos (submit/approve/pay/export checks).
// Changes to other fields (lastMessageText, lastReadTime, etc.) are irrelevant.
const TODO_RELEVANT_REPORT_KEYS: ReadonlyArray<keyof Report> = [
    'type',
    'reportID',
    'stateNum',
    'statusNum',
    'ownerAccountID',
    'managerID',
    'policyID',
    'chatReportID',
    'iouReportID',
    'isWaitingOnBankAccount',
    'isExportedToIntegration',
    'hasExportError',
    'total',
    'nonReimbursableTotal',
];

function hasNewExportRelevantActions(changedReportKeys: string[], allReportActions: OnyxCollection<ReportActions>): boolean {
    for (const reportKey of changedReportKeys) {
        const currentActions = allReportActions?.[reportKey];
        const previousActions = prevReportActions?.[reportKey];
        if (!currentActions) {
            continue;
        }
        for (const [actionID, action] of Object.entries(currentActions)) {
            if (!action || previousActions?.[actionID] === action) {
                continue;
            }
            if (EXPORT_RELEVANT_ACTION_TYPES.has(action.actionName)) {
                return true;
            }
        }
    }
    return false;
}

function hasTodoRelevantMetadataChange(changedKeys: string[], allReportMetadata: OnyxCollection<ReportMetadata>): boolean {
    for (const key of changedKeys) {
        const current = allReportMetadata?.[key];
        const previous = prevReportMetadata?.[key];
        if (current?.pendingExpenseAction !== previous?.pendingExpenseAction) {
            return true;
        }
    }
    return false;
}

function hasTodoRelevantReportChange(changedReportKeys: string[], allReports: OnyxCollection<Report>): boolean {
    for (const reportKey of changedReportKeys) {
        const currentReport = allReports?.[reportKey];
        const previousReport = prevReports?.[reportKey];
        if (!currentReport || !previousReport) {
            return true;
        }
        for (const field of TODO_RELEVANT_REPORT_KEYS) {
            const currentFieldValue = currentReport[field];
            const previousFieldValue = previousReport[field];
            if (currentFieldValue !== previousFieldValue) {
                // managerID: 0 and undefined/null both mean "not set"
                if (field === 'managerID' && !currentFieldValue && !previousFieldValue) {
                    continue;
                }
                return true;
            }
        }
    }
    return false;
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
    ],
    compute: (
        [allReports, allPolicies, allReportNameValuePairs, allTransactions, allReportActions, allReportMetadata, bankAccountList, session, personalDetailsList],
        {sourceValues, currentValue},
    ) => {
        if (currentValue && sourceValues) {
            // REPORT_ACTIONS: only affects todos via isExportAction (isExported / hasExportError).
            const reportActionsUpdates = sourceValues[ONYXKEYS.COLLECTION.REPORT_ACTIONS];
            if (reportActionsUpdates && prevReportActions && !hasNewExportRelevantActions(Object.keys(reportActionsUpdates), allReportActions)) {
                prevReportActions = allReportActions;
                return currentValue;
            }

            // REPORT: only todo-relevant fields (stateNum, statusNum, total, etc.) matter.
            const reportUpdates = sourceValues[ONYXKEYS.COLLECTION.REPORT];
            if (reportUpdates && prevReports && !hasTodoRelevantReportChange(Object.keys(reportUpdates), allReports)) {
                prevReports = allReports;
                return currentValue;
            }

            // REPORT_METADATA: only pendingExpenseAction matters for todos (DEW submit/approve).
            const reportMetadataUpdates = sourceValues[ONYXKEYS.COLLECTION.REPORT_METADATA];
            if (reportMetadataUpdates && prevReportMetadata && !hasTodoRelevantMetadataChange(Object.keys(reportMetadataUpdates), allReportMetadata)) {
                prevReportMetadata = allReportMetadata;
                return currentValue;
            }
        }
        prevReportActions = allReportActions;
        prevReports = allReports;
        prevReportMetadata = allReportMetadata;

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

        return {
            reportsToSubmit,
            reportsToApprove,
            reportsToPay,
            reportsToExport,
            transactionsByReportID,
        };
    },
});
