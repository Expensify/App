import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportActions, SearchResults, Transaction} from '@src/types/onyx';

/**
 * Returns the longest common dependent tag prefix for the provided transactions.
 * If there is no shared parent tag, returns undefined.
 */
function getCommonDependentTag(transactions: Array<OnyxEntry<Transaction> | undefined>): string | undefined {
    if (transactions.length === 0) {
        return;
    }

    const tagArrays = transactions.map((transaction) => getTagArrayFromName(transaction?.tag ?? ''));
    if (tagArrays.some((tagArray) => !tagArray.at(0))) {
        return;
    }

    const commonTags: string[] = [];
    const firstTagArray = tagArrays.at(0) ?? [];

    for (let index = 0; index < firstTagArray.length; index++) {
        const currentTag = firstTagArray.at(index);
        if (!currentTag) {
            break;
        }

        if (tagArrays.every((tagArray) => tagArray.at(index) === currentTag)) {
            commonTags.push(currentTag);
            continue;
        }

        break;
    }

    return commonTags.length > 0 ? commonTags.join(':') : undefined;
}

/**
 * Returns the transaction, report, reportAction, and policy for a given transaction ID.
 * Returns null if the transaction is not found.
 */
function getTransactionEditContext(
    transactionID: string,
    allTransactions: OnyxCollection<Transaction> | undefined,
    allReports: OnyxCollection<Report> | undefined,
    allReportActions: OnyxCollection<ReportActions> | undefined,
    policies: OnyxCollection<Policy> | undefined,
) {
    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    if (!transaction) {
        return null;
    }
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`] ?? {};
    const reportAction = getIOUActionForTransactionID(Object.values(reportActions), transactionID);
    const transactionPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    return {transaction, report, reportAction, transactionPolicy};
}

/**
 * Reported expenses check their own workspace policy; unreported (track) expenses fall back to
 * the bulk-edit workspace policy because they have no report to resolve a per-transaction policy from.
 */
function isBulkEditTaxTrackingEnabled(
    selectedTransactionContexts: Array<{transaction: Transaction; transactionPolicy: OnyxEntry<Policy>}>,
    bulkEditPolicy: OnyxEntry<Policy>,
    hasPerDiemOrTimeTransaction: boolean,
): boolean {
    if (hasPerDiemOrTimeTransaction) {
        return false;
    }
    return selectedTransactionContexts.every(({transaction, transactionPolicy}) => {
        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return !!bulkEditPolicy?.tax?.trackingEnabled;
        }
        return !!transactionPolicy?.tax?.trackingEnabled;
    });
}

/**
 * After a hard refresh, transaction/report/reportAction data may only exist in the search snapshot,
 * not in the main Onyx collections. These helpers fill gaps from the snapshot so bulk edit can work.
 */
function withSnapshotTransactions(onyxTransactions: OnyxCollection<Transaction> | undefined, snapshotData: SearchResults['data'] | undefined): OnyxCollection<Transaction> | undefined {
    if (!snapshotData) {
        return onyxTransactions;
    }
    const merged = {...onyxTransactions};
    for (const key of Object.keys(snapshotData)) {
        if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            continue;
        }
        const typedKey = key as `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`;
        if (!merged[typedKey]) {
            merged[typedKey] = snapshotData[typedKey] ?? null;
        }
    }
    return merged;
}

function withSnapshotReportActions(onyxReportActions: OnyxCollection<ReportActions> | undefined, snapshotData: SearchResults['data'] | undefined): OnyxCollection<ReportActions> | undefined {
    if (!snapshotData) {
        return onyxReportActions;
    }
    const merged = {...onyxReportActions};
    for (const key of Object.keys(snapshotData)) {
        if (!key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
            continue;
        }
        const typedKey = key as `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}`;
        merged[typedKey] = {...(snapshotData[typedKey] ?? {}), ...(merged[typedKey] ?? {})};
    }
    return merged;
}

function withSnapshotReports(onyxReports: OnyxCollection<Report> | undefined, snapshotData: SearchResults['data'] | undefined): OnyxCollection<Report> | undefined {
    if (!snapshotData) {
        return onyxReports;
    }
    const merged = {...onyxReports};
    for (const key of Object.keys(snapshotData)) {
        if (!key.startsWith(ONYXKEYS.COLLECTION.REPORT) || key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
            continue;
        }
        const typedKey = key as `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;
        if (!merged[typedKey]) {
            merged[typedKey] = snapshotData[typedKey] ?? null;
        }
    }
    return merged;
}

export {getCommonDependentTag, getTransactionEditContext, isBulkEditTaxTrackingEnabled, withSnapshotTransactions, withSnapshotReportActions, withSnapshotReports};
