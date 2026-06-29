import {deepEqual} from 'fast-equals';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from '@libs/ReportPrimaryActionUtils';
import {hasOnlyHeldExpenses, hasOnlyNonReimbursableTransactions} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, PersonalDetailsList, Policy, Report, ReportActions, ReportMetadata, ReportNameValuePairs, Transaction} from '@src/types/onyx';

// Last-activity fields `addComment` merges onto a report. None are read by the todo eligibility checks
// (isSubmitAction/isApproveAction/isPrimaryPayAction/isExportAction), so a change confined to them is irrelevant.
const REPORT_FIELDS_IRRELEVANT_TO_TODOS = ['lastVisibleActionCreated', 'lastMessageText', 'lastMessageHtml', 'lastActorAccountID', 'lastReadTime', 'lastActionType'] as const;

/**
 * Projects a report to the slice that can affect the todo lists, so chat activity (e.g. `addComment`)
 * doesn't trigger an O(all-reports) recompute:
 *  - todos only ever considers EXPENSE reports, so any other report collapses to just its `type` — a
 *    change to a non-expense report (most chat traffic) can't alter the output and is gated. This is
 *    safe because the compute never reads non-expense report objects.
 *  - the last-activity fields `addComment` writes are stripped.
 *  - `managerID` is normalized to `?? DEFAULT_NUMBER_ID`, matching how `isApproveAction` reads it, so the
 *    common `undefined -> 0` placeholder write produces no delta.
 */
const reportTodoSelector = (report: OnyxEntry<Report>) => {
    if (!report) {
        return report;
    }
    if (report.type !== CONST.REPORT.TYPE.EXPENSE) {
        return {type: report.type};
    }
    const projection: Partial<Report> = {...report};
    for (const field of REPORT_FIELDS_IRRELEVANT_TO_TODOS) {
        delete projection[field];
    }
    projection.managerID = report.managerID ?? CONST.DEFAULT_NUMBER_ID;
    return projection;
};

/**
 * Projects a report's actions to only what the todo eligibility reads (export-state detection in
 * `isExportAction` → `isExported`/`hasExportError`, which read `actionName`, `created`, `originalMessage`).
 * `ADD_COMMENT` actions are excluded entirely, and per-action chat metadata (`childVisibleActionCount`,
 * `pendingAction`, `errors`, …) is dropped — so `addComment`'s optimistic comment, its success/failure
 * patches, and ancestor `child*` bumps all project to an unchanged value and don't trigger a recompute.
 * Compared with `deepEqual` since the projection allocates new objects each run.
 */
const reportActionsTodoSelector = (reportActions: OnyxEntry<ReportActions>) => {
    if (!reportActions) {
        return reportActions;
    }
    const projection: Array<{actionName: string; created: string; originalMessage: unknown}> = [];
    for (const action of Object.values(reportActions)) {
        if (!action || action.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
            continue;
        }
        projection.push({actionName: action.actionName, created: action.created, originalMessage: getOriginalMessage(action)});
    }
    return projection;
};

type CreateTodosReportsAndTransactionsParams = {
    allReports: OnyxCollection<Report>;
    allTransactions: OnyxCollection<Transaction>;
    allPolicies: OnyxCollection<Policy>;
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    allReportActions: OnyxCollection<ReportActions>;
    allReportMetadata: OnyxCollection<ReportMetadata>;
    personalDetailsList: OnyxEntry<PersonalDetailsList>;
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
    personalDetailsList,
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
        const allExpensesHeld = hasOnlyHeldExpenses(reportTransactions);
        if (
            isSubmitAction(
                report,
                reportTransactions,
                reportMetadata,
                getLoginByAccountID(report.ownerAccountID, personalDetailsList),
                policy,
                reportNameValuePair,
                undefined,
                login,
                currentUserAccountID,
            ) &&
            !allExpensesHeld
        ) {
            reportsToSubmit.push(report);
        }
        if (isApproveAction(report, reportTransactions, currentUserAccountID, reportMetadata, policy) && !allExpensesHeld) {
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
            !hasOnlyNonReimbursableTransactions(report.reportID, reportTransactions) &&
            !allExpensesHeld
        ) {
            reportsToPay.push(report);
        }
        if (isExportAction(report, login, policy, reportActions) && policy?.exporter === login) {
            reportsToExport.push(report);
        }
    }

    return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID};
};

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.TODOS,
    dependencies: [
        {key: ONYXKEYS.COLLECTION.REPORT, selector: reportTodoSelector},
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.COLLECTION.TRANSACTION,
        {key: ONYXKEYS.COLLECTION.REPORT_ACTIONS, selector: reportActionsTodoSelector, isEqual: deepEqual},
        ONYXKEYS.COLLECTION.REPORT_METADATA,
        ONYXKEYS.BANK_ACCOUNT_LIST,
        ONYXKEYS.SESSION,
        ONYXKEYS.PERSONAL_DETAILS_LIST,
    ],
    compute: ([allReports, allPolicies, allReportNameValuePairs, allTransactions, allReportActions, allReportMetadata, bankAccountList, session, personalDetailsList]) => {
        const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const login = personalDetailsList?.[userAccountID]?.login ?? session?.email ?? '';

        const {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID} = createTodosReportsAndTransactions({
            allReports,
            allTransactions,
            allPolicies,
            allReportNameValuePairs,
            allReportActions,
            allReportMetadata,
            personalDetailsList,
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
