import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isInvoiceReport, isIOUReport, shouldEnableNegative} from '@libs/ReportUtils';
import {getUpdatedTransactionTag} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName, isDistanceRequest, isPerDiemRequest} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, Report, ReportActions, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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
 * Returns the transaction, report, reportAction, the report's actions, and policy for a given transaction ID.
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
    return {transaction, report, reportAction, reportActions, transactionPolicy};
}

/**
 * Distance and per-diem transactions have a system-derived merchant that cannot be user-edited
 * regardless of whether the transaction is reported or unreported.
 */
function hasCustomUnitMerchantInSelection(selectedTransactionContexts: Array<{transaction: Transaction}>): boolean {
    return selectedTransactionContexts.some(({transaction}) => isDistanceRequest(transaction) || isPerDiemRequest(transaction));
}

/**
 * Category/Tag/Tax only apply to expense/invoice reports and unreported (track) expenses.
 * Returns true only when every selected transaction is eligible.
 */
function areAllTransactionsExpenseCompatible(selectedTransactionContexts: Array<{transaction: Transaction; report: OnyxEntry<Report>}>): boolean {
    return selectedTransactionContexts.every(({transaction, report}) => {
        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return true;
        }
        return !isIOUReport(report);
    });
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
 * Reported expenses check their own workspace policy; unreported expenses fall back to
 * the bulk-edit workspace policy because they have no report to resolve a per-transaction policy from.
 */
function isBulkEditAttendeeTrackingEnabled(
    selectedTransactionContexts: Array<{transaction: Transaction; report: OnyxEntry<Report>; transactionPolicy: OnyxEntry<Policy>}>,
    bulkEditPolicy: OnyxEntry<Policy>,
): boolean {
    return selectedTransactionContexts.every(({transaction, report, transactionPolicy}) => {
        if (isInvoiceReport(report)) {
            return false;
        }

        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return isAttendeeTrackingEnabled(bulkEditPolicy) && bulkEditPolicy?.type === CONST.POLICY.TYPE.CORPORATE;
        }

        return isAttendeeTrackingEnabled(transactionPolicy) && transactionPolicy?.type === CONST.POLICY.TYPE.CORPORATE;
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

/**
 * Whether the amount typed on the bulk edit form may be negative: only when every selected expense allows it.
 * An unreported expense always does; a reported one follows its report and workspace.
 */
function isBulkEditNegativeAmountAllowed(
    selectedTransactionContexts: Array<{transaction: Transaction; report: OnyxEntry<Report>}>,
    reports: OnyxCollection<Report>,
    policies: OnyxCollection<Policy>,
): boolean {
    if (selectedTransactionContexts.length === 0) {
        return false;
    }
    return selectedTransactionContexts.every(({transaction, report}) => {
        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return true;
        }
        // A chat report stands in for the money request report it belongs to.
        const iouReport = report?.type === CONST.REPORT.TYPE.CHAT && report.parentReportID ? reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`] : report;
        if (!iouReport) {
            return false;
        }
        const iouType = isInvoiceReport(iouReport) ? CONST.IOU.TYPE.INVOICE : CONST.IOU.TYPE.SUBMIT;
        return shouldEnableNegative(iouReport, policies?.[`${ONYXKEYS.COLLECTION.POLICY}${iouReport.policyID}`], iouType);
    });
}

/** The draft change for a picked category. Picking nothing, or the category already picked, drops the pending change. */
function getBulkEditCategoryChange(nextCategory: string, currentCategory: string): {category: string | null} {
    return {category: !nextCategory || nextCategory === currentCategory ? null : nextCategory};
}

/** The draft change for a picked tax rate. Picking the rate already picked drops the pending change. */
function getBulkEditTaxCodeChange(nextTaxCode: string, currentTaxCode: string): {taxCode: string | null} {
    return {taxCode: nextTaxCode === currentTaxCode ? null : nextTaxCode};
}

type BulkEditTagChangeParams = {
    /** The tag picked on this level. Picking the level's current tag again clears it. */
    selectedTagName: string;

    /** The tag the level holds before the pick */
    currentTag: string;

    tagListIndex: number;

    /** The whole multi-level tag the draft shows */
    transactionTag: string;

    /** The per-level intents already recorded on the draft, which drive the save */
    recordedTagChanges: Record<string, string | null>;

    policyTags: OnyxEntry<PolicyTagLists>;
    hasDependentTags: boolean;
    hasMultipleTagLists: boolean;
};

/**
 * The draft change for a tag picked on one level: the multi-level tag to show, and the per-level intents to save.
 * Clearing a level the user picked in this session drops its intent; clearing one the expenses already hold records a clear.
 */
function getBulkEditTagChange({selectedTagName, currentTag, tagListIndex, transactionTag, recordedTagChanges, policyTags, hasDependentTags, hasMultipleTagLists}: BulkEditTagChangeParams): {
    tag: string;
    bulkEditTagChanges: Record<string, string | null>;
} {
    const isDeselecting = selectedTagName === currentTag;

    const tag = getUpdatedTransactionTag({
        transactionTag,
        selectedTagName,
        currentTag,
        tagListIndex,
        policyTags,
        hasDependentTags,
        hasMultipleTagLists,
    });

    const isUndoingOwnPick = isDeselecting && recordedTagChanges[tagListIndex] === currentTag;
    const deselectValue = isUndoingOwnPick ? null : '';
    const bulkEditTagChanges: Record<string, string | null> = {[tagListIndex]: isDeselecting ? deselectValue : selectedTagName};

    // Changing a dependent level makes the deeper ones stale, so their intents are dropped before they get replayed.
    if (hasDependentTags) {
        for (const recordedIndex of Object.keys(recordedTagChanges)) {
            if (Number(recordedIndex) <= tagListIndex) {
                continue;
            }
            bulkEditTagChanges[recordedIndex] = null;
        }
    }

    return {tag, bulkEditTagChanges};
}

export {
    getCommonDependentTag,
    getTransactionEditContext,
    hasCustomUnitMerchantInSelection,
    areAllTransactionsExpenseCompatible,
    isBulkEditTaxTrackingEnabled,
    isBulkEditAttendeeTrackingEnabled,
    isBulkEditNegativeAmountAllowed,
    getBulkEditCategoryChange,
    getBulkEditTaxCodeChange,
    getBulkEditTagChange,
    withSnapshotTransactions,
    withSnapshotReportActions,
    withSnapshotReports,
};
