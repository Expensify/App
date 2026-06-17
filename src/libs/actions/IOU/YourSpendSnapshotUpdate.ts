import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-imports -- Your spend "Awaiting approval"/"Repaid" totals are a billing/paid-only feature (Collect/Control), so paid-group scoping is intentional here.
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {isExpenseReport, isInvoiceReport as isInvoiceReportReportUtils} from '@libs/ReportUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getAmount, getConvertedAmount, getCurrency} from '@libs/TransactionUtils';
import {buildAwaitingApprovalQuery, buildRepaidLast30DaysQuery, get30DaysAgoDateString} from '@libs/YourSpendQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';

type YourSpendSnapshotOnyxData = {
    optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>>;
    successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>>;
    failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>>;
};

type GetYourSpendSnapshotTotalUpdatesParams = {
    transaction: OnyxEntry<Transaction>;
    updatedTransaction: OnyxEntry<Transaction>;
    iouReport: OnyxEntry<Report>;
    currentUserAccountID: number;
};

// connectWithoutView: snapshot/policy reads are for optimistic Your spend total patches only.
let allSnapshots: OnyxCollection<SearchResults> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.SNAPSHOT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allSnapshots = value ?? {};
    },
});

let allPolicies: OnyxCollection<Policy> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicies = value ?? {};
    },
});

function getPaidGroupPolicyIDs(): string[] {
    const policyIDs: string[] = [];
    for (const policy of Object.values(allPolicies ?? {})) {
        if (policy?.id && isPaidGroupPolicy(policy)) {
            policyIDs.push(policy.id);
        }
    }
    return policyIDs;
}

function transactionMatchesAwaitingApprovalQuery(iouReport: OnyxEntry<Report>, transaction: OnyxEntry<Transaction>, accountID: number, paidGroupPolicyIDs: string[]): boolean {
    if (!iouReport || !transaction) {
        return false;
    }
    if (iouReport.ownerAccountID !== accountID) {
        return false;
    }
    if (transaction.reimbursable === false) {
        return false;
    }
    if (!iouReport.policyID || !paidGroupPolicyIDs.includes(iouReport.policyID)) {
        return false;
    }
    return iouReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && iouReport.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

function transactionMatchesRepaidLast30DaysQuery(iouReport: OnyxEntry<Report>, transaction: OnyxEntry<Transaction>, accountID: number): boolean {
    if (!iouReport || !transaction) {
        return false;
    }
    if (iouReport.ownerAccountID !== accountID) {
        return false;
    }
    if (transaction.reimbursable === false) {
        return false;
    }
    const isPaid = (iouReport.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && iouReport.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
    if (!isPaid) {
        return false;
    }
    const created = transaction.created?.slice(0, 10);
    if (!created) {
        return false;
    }
    return created >= get30DaysAgoDateString();
}

function buildSnapshotTotalUpdatesForHash(snapshotHash: number | undefined, diff: number, currency: string, countDiff = 0): YourSpendSnapshotOnyxData {
    if (!snapshotHash || (diff === 0 && countDiff === 0)) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as const;
    const currentSnapshot = allSnapshots?.[snapshotKey];
    const currentTotal = currentSnapshot?.search?.total;
    const currentCurrency = currentSnapshot?.search?.currency;
    const currentCount = currentSnapshot?.search?.count ?? 0;

    if (currentTotal === undefined || currentTotal === null) {
        return {optimisticData: [], successData: [], failureData: []};
    }
    if (currentCurrency && currentCurrency !== currency) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const updatedTotal = currentTotal + diff;
    // `count` drives the Home row's visibility (see getYourSpendRowState): it must move in lockstep with `total`,
    // otherwise an add into a previously empty bucket stays hidden and a removal of the last item shows a stale $0.00.
    const updatedCount = Math.max(0, currentCount + countDiff);
    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: snapshotKey,
                value: {
                    search: {
                        total: updatedTotal,
                        count: updatedCount,
                        currency,
                    },
                },
            },
        ],
        successData: [],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: snapshotKey,
                value: {
                    search: {
                        total: currentTotal,
                        count: currentCount,
                        currency: currentCurrency ?? currency,
                    },
                },
            },
        ],
    };
}

function mergeYourSpendSnapshotOnyxData(target: YourSpendSnapshotOnyxData, source: YourSpendSnapshotOnyxData) {
    target.optimisticData.push(...source.optimisticData);
    target.successData.push(...source.successData);
    target.failureData.push(...source.failureData);
}

function calculateYourSpendTotalDiff(iouReport: OnyxEntry<Report>, updatedTransaction: OnyxEntry<Transaction>, transaction: OnyxEntry<Transaction>): number | null {
    if (!iouReport || !updatedTransaction || !transaction) {
        return null;
    }

    const isExpenseReportLocal = isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport);
    const currentCurrency = getCurrency(transaction);
    const updatedCurrency = getCurrency(updatedTransaction);

    // A currency change can't be expressed as a simple amount delta on the snapshot total without converting between
    // currencies, and FX rates aren't available offline (totals are converted server-side). Skip patching in that case.
    if (currentCurrency !== updatedCurrency) {
        return null;
    }

    const currentTotal = Math.abs(getAmount(transaction, isExpenseReportLocal));
    const updatedTotal = Math.abs(getAmount(updatedTransaction, isExpenseReportLocal));

    if (currentTotal === updatedTotal) {
        return 0;
    }

    return updatedTotal - currentTotal;
}

type ReportStatus = Pick<Report, 'stateNum' | 'statusNum'>;

type GetYourSpendSnapshotReportMoveUpdatesParams = {
    iouReport: OnyxEntry<Report>;
    reportTransactions: Transaction[];
    fromStatus: ReportStatus;
    toStatus: ReportStatus;
    currentUserAccountID: number;
};

function isAwaitingApprovalStatus(status: ReportStatus): boolean {
    return status.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && status.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

function isRepaidStatus(status: ReportStatus): boolean {
    return (status.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && status.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
}

function reportInAwaitingApprovalScope(iouReport: OnyxEntry<Report>, accountID: number, paidGroupPolicyIDs: string[]): boolean {
    if (!iouReport || iouReport.ownerAccountID !== accountID) {
        return false;
    }
    return !!iouReport.policyID && paidGroupPolicyIDs.includes(iouReport.policyID);
}

function reportInRepaidScope(iouReport: OnyxEntry<Report>, accountID: number): boolean {
    return !!iouReport && iouReport.ownerAccountID === accountID;
}

function getSnapshotSearchResults(snapshotHash: number | undefined) {
    if (!snapshotHash) {
        return undefined;
    }
    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as const;
    return allSnapshots?.[snapshotKey]?.search;
}

/** Returns a transaction's reimbursable amount in the snapshot currency, or null when conversion is unavailable offline. */
function getReimbursableTransactionAmountInCurrency(transaction: Transaction, iouReport: OnyxEntry<Report>, targetCurrency: string): number | null {
    const isExpenseReportLocal = isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport);
    const transactionCurrency = getCurrency(transaction);

    if (transactionCurrency === targetCurrency) {
        return Math.abs(getAmount(transaction, isExpenseReportLocal));
    }
    if (transaction.convertedAmount != null) {
        return Math.abs(getConvertedAmount(transaction, isExpenseReportLocal));
    }

    return null;
}

type ReportReimbursableAggregate = {
    total: number;
    // Number of reimbursable transactions contributing to `total`. Kept alongside `total` so the snapshot's
    // result `count` can be patched in lockstep when the report enters or leaves a Your spend section.
    count: number;
};

/** Sums reimbursable transactions (and counts them) in the snapshot currency, optionally restricted to the last 30 days. */
function getReportReimbursableTotal(
    iouReport: OnyxEntry<Report>,
    reportTransactions: Transaction[],
    onlyWithinLast30Days: boolean,
    targetCurrency: string,
): ReportReimbursableAggregate | null {
    let total = 0;
    let count = 0;

    for (const reportTransaction of reportTransactions) {
        if (!reportTransaction || reportTransaction.reimbursable === false) {
            continue;
        }
        if (onlyWithinLast30Days) {
            const created = reportTransaction.created?.slice(0, 10);
            if (!created || created < get30DaysAgoDateString()) {
                continue;
            }
        }

        const amount = getReimbursableTransactionAmountInCurrency(reportTransaction, iouReport, targetCurrency);
        if (amount === null) {
            return null;
        }
        total += amount;
        count += 1;
    }

    return {total, count};
}

/**
 * Optimistically patches Your spend snapshot aggregates when a report moves between states (e.g. submit, retract,
 * reject, unapprove, cancel payment). The report's reimbursable total is added to the section it enters and removed
 * from the section it leaves, since Home reads totals from `snapshot.search.total` which is only refreshed online.
 */
function getYourSpendSnapshotReportMoveUpdates({
    iouReport,
    reportTransactions,
    fromStatus,
    toStatus,
    currentUserAccountID,
}: GetYourSpendSnapshotReportMoveUpdatesParams): YourSpendSnapshotOnyxData {
    const result: YourSpendSnapshotOnyxData = {optimisticData: [], successData: [], failureData: []};
    if (!iouReport) {
        return result;
    }

    const paidGroupPolicyIDs = getPaidGroupPolicyIDs();
    const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(currentUserAccountID, paidGroupPolicyIDs));
    const approvalSnapshotCurrency = getSnapshotSearchResults(approvalQueryJSON?.hash)?.currency;

    if (reportInAwaitingApprovalScope(iouReport, currentUserAccountID, paidGroupPolicyIDs) && approvalSnapshotCurrency) {
        const aggregate = getReportReimbursableTotal(iouReport, reportTransactions, false, approvalSnapshotCurrency);
        if (aggregate !== null) {
            const enters = isAwaitingApprovalStatus(toStatus);
            const leaves = isAwaitingApprovalStatus(fromStatus);
            const diff = (enters ? aggregate.total : 0) - (leaves ? aggregate.total : 0);
            const countDiff = (enters ? aggregate.count : 0) - (leaves ? aggregate.count : 0);
            if (diff !== 0 || countDiff !== 0) {
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(approvalQueryJSON?.hash, diff, approvalSnapshotCurrency, countDiff));
            }
        }
    }

    if (reportInRepaidScope(iouReport, currentUserAccountID)) {
        const paymentQueryJSON = buildSearchQueryJSON(buildRepaidLast30DaysQuery(currentUserAccountID));
        const paymentSnapshotCurrency = getSnapshotSearchResults(paymentQueryJSON?.hash)?.currency;
        if (paymentSnapshotCurrency) {
            const aggregate = getReportReimbursableTotal(iouReport, reportTransactions, true, paymentSnapshotCurrency);
            if (aggregate !== null) {
                const enters = isRepaidStatus(toStatus);
                const leaves = isRepaidStatus(fromStatus);
                const diff = (enters ? aggregate.total : 0) - (leaves ? aggregate.total : 0);
                const countDiff = (enters ? aggregate.count : 0) - (leaves ? aggregate.count : 0);
                if (diff !== 0 || countDiff !== 0) {
                    mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(paymentQueryJSON?.hash, diff, paymentSnapshotCurrency, countDiff));
                }
            }
        }
    }

    return result;
}

type GetYourSpendSnapshotTransactionRemovalUpdatesParams = {
    transaction: OnyxEntry<Transaction>;
    iouReport: OnyxEntry<Report>;
    currentUserAccountID: number;
};

/**
 * Optimistically patches Your spend snapshot aggregates when a single transaction leaves a report (e.g. delete or
 * reject), subtracting its reimbursable amount from whichever section the report currently belongs to.
 */
function getYourSpendSnapshotTransactionRemovalUpdates({transaction, iouReport, currentUserAccountID}: GetYourSpendSnapshotTransactionRemovalUpdatesParams): YourSpendSnapshotOnyxData {
    const result: YourSpendSnapshotOnyxData = {optimisticData: [], successData: [], failureData: []};
    if (!transaction || !iouReport) {
        return result;
    }

    const paidGroupPolicyIDs = getPaidGroupPolicyIDs();

    if (transactionMatchesAwaitingApprovalQuery(iouReport, transaction, currentUserAccountID, paidGroupPolicyIDs)) {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(currentUserAccountID, paidGroupPolicyIDs));
        const approvalSnapshotCurrency = getSnapshotSearchResults(approvalQueryJSON?.hash)?.currency;
        if (approvalSnapshotCurrency) {
            const amount = getReimbursableTransactionAmountInCurrency(transaction, iouReport, approvalSnapshotCurrency);
            if (amount !== null) {
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(approvalQueryJSON?.hash, -amount, approvalSnapshotCurrency, -1));
            }
        }
    }

    if (transactionMatchesRepaidLast30DaysQuery(iouReport, transaction, currentUserAccountID)) {
        const paymentQueryJSON = buildSearchQueryJSON(buildRepaidLast30DaysQuery(currentUserAccountID));
        const paymentSnapshotCurrency = getSnapshotSearchResults(paymentQueryJSON?.hash)?.currency;
        if (paymentSnapshotCurrency) {
            const amount = getReimbursableTransactionAmountInCurrency(transaction, iouReport, paymentSnapshotCurrency);
            if (amount !== null) {
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(paymentQueryJSON?.hash, -amount, paymentSnapshotCurrency, -1));
            }
        }
    }

    return result;
}

/**
 * Optimistically patches Your spend snapshot aggregates when a transaction amount changes.
 * Home reads totals from `snapshot.search.total`, which is only refreshed via search() while online.
 */
function getYourSpendSnapshotTotalUpdates({transaction, updatedTransaction, iouReport, currentUserAccountID}: GetYourSpendSnapshotTotalUpdatesParams): YourSpendSnapshotOnyxData {
    const emptyResult: YourSpendSnapshotOnyxData = {optimisticData: [], successData: [], failureData: []};
    if (!transaction || !updatedTransaction || !iouReport) {
        return emptyResult;
    }

    const diff = calculateYourSpendTotalDiff(iouReport, updatedTransaction, transaction);
    if (diff === null || diff === 0) {
        return emptyResult;
    }

    const currency = getCurrency(updatedTransaction);
    const paidGroupPolicyIDs = getPaidGroupPolicyIDs();
    const result: YourSpendSnapshotOnyxData = {optimisticData: [], successData: [], failureData: []};

    if (transactionMatchesAwaitingApprovalQuery(iouReport, transaction, currentUserAccountID, paidGroupPolicyIDs)) {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(currentUserAccountID, paidGroupPolicyIDs));
        mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(approvalQueryJSON?.hash, diff, currency));
    }

    if (transactionMatchesRepaidLast30DaysQuery(iouReport, transaction, currentUserAccountID)) {
        const paymentQueryJSON = buildSearchQueryJSON(buildRepaidLast30DaysQuery(currentUserAccountID));
        mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(paymentQueryJSON?.hash, diff, currency));
    }

    return result;
}

export {getYourSpendSnapshotReportMoveUpdates, getYourSpendSnapshotTotalUpdates, getYourSpendSnapshotTransactionRemovalUpdates, transactionMatchesAwaitingApprovalQuery};
