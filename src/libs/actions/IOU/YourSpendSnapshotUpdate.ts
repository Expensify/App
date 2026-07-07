// eslint-disable-next-line no-restricted-imports -- Your spend "Awaiting approval"/"Repaid" totals are a billing/paid-only feature (Collect/Control), so paid-group scoping is intentional here.
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {isExpenseReport, isInvoiceReport as isInvoiceReportReportUtils} from '@libs/ReportUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getAmount, getConvertedAmount, getCurrency} from '@libs/TransactionUtils';
import {buildAwaitingApprovalQuery, buildRepaidLast30DaysQuery, get30DaysAgoDateString} from '@libs/YourSpendQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

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

// Mirror only each snapshot's `search` aggregates; dropping the large `data` blob keeps this bounded regardless of how many searches are cached.
type SnapshotSearch = SearchResults['search'];
let allSnapshotSearches: Record<string, SnapshotSearch | undefined> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.SNAPSHOT,
    waitForCollectionCallback: true,
    callback: (value) => {
        const next: Record<string, SnapshotSearch> = {};
        for (const [key, snapshot] of Object.entries(value ?? {})) {
            if (snapshot?.search) {
                next[key] = snapshot.search;
            }
        }
        allSnapshotSearches = next;
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
    return created > get30DaysAgoDateString();
}

function buildSnapshotTotalUpdatesForHash(snapshotHash: number | undefined, diff: number, currency: string, countDiff = 0): YourSpendSnapshotOnyxData {
    if (!snapshotHash || (diff === 0 && countDiff === 0)) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as const;
    const search = allSnapshotSearches[snapshotKey];

    // Skip when the snapshot isn't loaded; a loaded-but-empty snapshot is a valid zero base.
    if (!search) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const currentCurrency = search.currency;
    const currentTotal = search.total ?? 0;
    const currentCount = search.count ?? 0;

    if (currentCurrency && currentCurrency !== currency) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const updatedTotal = currentTotal + diff;
    // `count` drives row visibility, so it must move in lockstep with `total`.
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
                        total: search.total ?? null,
                        count: search.count ?? null,
                        currency: currentCurrency ?? null,
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

    // A currency change can't be patched offline (FX rates are server-side only).
    if (currentCurrency !== updatedCurrency) {
        return null;
    }

    // Signed to match the snapshot `total` convention (spend negative, credits positive).
    const currentTotal = getAmount(transaction, isExpenseReportLocal);
    const updatedTotal = getAmount(updatedTransaction, isExpenseReportLocal);

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
    return allSnapshotSearches[snapshotKey];
}

/** Returns a transaction's signed reimbursable amount in the snapshot currency, or null when conversion is unavailable offline. */
function getReimbursableTransactionAmountInCurrency(transaction: Transaction, iouReport: OnyxEntry<Report>, targetCurrency: string): number | null {
    const isExpenseReportLocal = isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport);
    const transactionCurrency = getCurrency(transaction);

    if (transactionCurrency === targetCurrency) {
        return getAmount(transaction, isExpenseReportLocal);
    }
    // `convertedAmount` is in the policy output currency; only trust it when that matches the target currency.
    const policyOutputCurrency = iouReport?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${iouReport.policyID}`]?.outputCurrency : undefined;
    if (transaction.convertedAmount != null && policyOutputCurrency === targetCurrency) {
        return getConvertedAmount(transaction, isExpenseReportLocal);
    }

    return null;
}

type ReportReimbursableAggregate = {
    total: number;
    count: number;
    // Contributing transactions, injected into `snapshot.data` so the Search page isn't empty offline.
    transactions: Transaction[];
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
    const transactions: Transaction[] = [];

    for (const reportTransaction of reportTransactions) {
        if (!reportTransaction || reportTransaction.reimbursable === false) {
            continue;
        }
        if (onlyWithinLast30Days) {
            const created = reportTransaction.created?.slice(0, 10);
            if (!created || created <= get30DaysAgoDateString()) {
                continue;
            }
        }

        const amount = getReimbursableTransactionAmountInCurrency(reportTransaction, iouReport, targetCurrency);
        if (amount === null) {
            return null;
        }
        total += amount;
        count += 1;
        transactions.push(reportTransaction);
    }

    return {total, count, transactions};
}

/** Adds (or removes) a report's reimbursable transactions in `snapshot.data` when it enters (or leaves) a section, so the Search page isn't empty offline. */
function buildSnapshotDataUpdatesForHash(snapshotHash: number | undefined, transactions: Transaction[], enters: boolean, leaves: boolean): YourSpendSnapshotOnyxData {
    // Only a section crossing (enter XOR leave) changes membership.
    if (!snapshotHash || transactions.length === 0 || enters === leaves) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as const;
    if (!allSnapshotSearches[snapshotKey]) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const presentData: SearchResultDataType = {};
    const absentData: NullishDeep<SearchResultDataType> = {};
    for (const transaction of transactions) {
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}` as const;
        presentData[transactionKey] = transaction;
        absentData[transactionKey] = null;
    }

    const optimisticDataValue = enters ? presentData : absentData;
    const failureDataValue = enters ? absentData : presentData;

    return {
        optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: snapshotKey, value: {data: optimisticDataValue}}],
        successData: [],
        failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: snapshotKey, value: {data: failureDataValue}}],
    };
}

/** Optimistically patches Your spend snapshot aggregates when a report moves between states (e.g. submit, retract, reject, unapprove, cancel payment). */
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
    const approvalSnapshotSearch = getSnapshotSearchResults(approvalQueryJSON?.hash);
    const approvalSnapshotCurrency = approvalSnapshotSearch?.currency;
    // An empty section's snapshot has no currency yet, so fall back to the report's currency.
    const approvalTargetCurrency = approvalSnapshotCurrency ?? iouReport.currency;

    if (reportInAwaitingApprovalScope(iouReport, currentUserAccountID, paidGroupPolicyIDs) && approvalSnapshotSearch && approvalTargetCurrency) {
        const aggregate = getReportReimbursableTotal(iouReport, reportTransactions, false, approvalTargetCurrency);
        if (aggregate !== null) {
            const enters = isAwaitingApprovalStatus(toStatus);
            const leaves = isAwaitingApprovalStatus(fromStatus);
            const diff = (enters ? aggregate.total : 0) - (leaves ? aggregate.total : 0);
            const countDiff = (enters ? aggregate.count : 0) - (leaves ? aggregate.count : 0);
            if (diff !== 0 || countDiff !== 0) {
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(approvalQueryJSON?.hash, diff, approvalTargetCurrency, countDiff));
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotDataUpdatesForHash(approvalQueryJSON?.hash, aggregate.transactions, enters, leaves));
            }
        }
    }

    if (reportInRepaidScope(iouReport, currentUserAccountID)) {
        const paymentQueryJSON = buildSearchQueryJSON(buildRepaidLast30DaysQuery(currentUserAccountID));
        const paymentSnapshotSearch = getSnapshotSearchResults(paymentQueryJSON?.hash);
        const paymentTargetCurrency = paymentSnapshotSearch?.currency ?? iouReport.currency;
        if (paymentSnapshotSearch && paymentTargetCurrency) {
            const aggregate = getReportReimbursableTotal(iouReport, reportTransactions, true, paymentTargetCurrency);
            if (aggregate !== null) {
                const enters = isRepaidStatus(toStatus);
                const leaves = isRepaidStatus(fromStatus);
                const diff = (enters ? aggregate.total : 0) - (leaves ? aggregate.total : 0);
                const countDiff = (enters ? aggregate.count : 0) - (leaves ? aggregate.count : 0);
                if (diff !== 0 || countDiff !== 0) {
                    mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(paymentQueryJSON?.hash, diff, paymentTargetCurrency, countDiff));
                    mergeYourSpendSnapshotOnyxData(result, buildSnapshotDataUpdatesForHash(paymentQueryJSON?.hash, aggregate.transactions, enters, leaves));
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
 * Optimistically patches Your spend snapshot aggregates when a single transaction enters or leaves the reimbursable-only sections.
 * `enters` adds the transaction's amount/count (and its `data` row); otherwise it subtracts them.
 */
function getYourSpendSnapshotTransactionMembershipUpdates(
    transaction: OnyxEntry<Transaction>,
    iouReport: OnyxEntry<Report>,
    currentUserAccountID: number,
    enters: boolean,
): YourSpendSnapshotOnyxData {
    const result: YourSpendSnapshotOnyxData = {optimisticData: [], successData: [], failureData: []};
    if (!transaction || !iouReport) {
        return result;
    }

    const paidGroupPolicyIDs = getPaidGroupPolicyIDs();
    const sign = enters ? 1 : -1;

    if (transactionMatchesAwaitingApprovalQuery(iouReport, transaction, currentUserAccountID, paidGroupPolicyIDs)) {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(currentUserAccountID, paidGroupPolicyIDs));
        const approvalSnapshotCurrency = getSnapshotSearchResults(approvalQueryJSON?.hash)?.currency;
        if (approvalSnapshotCurrency) {
            const amount = getReimbursableTransactionAmountInCurrency(transaction, iouReport, approvalSnapshotCurrency);
            if (amount !== null) {
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(approvalQueryJSON?.hash, sign * amount, approvalSnapshotCurrency, sign));
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotDataUpdatesForHash(approvalQueryJSON?.hash, [transaction], enters, !enters));
            }
        }
    }

    if (transactionMatchesRepaidLast30DaysQuery(iouReport, transaction, currentUserAccountID)) {
        const paymentQueryJSON = buildSearchQueryJSON(buildRepaidLast30DaysQuery(currentUserAccountID));
        const paymentSnapshotCurrency = getSnapshotSearchResults(paymentQueryJSON?.hash)?.currency;
        if (paymentSnapshotCurrency) {
            const amount = getReimbursableTransactionAmountInCurrency(transaction, iouReport, paymentSnapshotCurrency);
            if (amount !== null) {
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(paymentQueryJSON?.hash, sign * amount, paymentSnapshotCurrency, sign));
                mergeYourSpendSnapshotOnyxData(result, buildSnapshotDataUpdatesForHash(paymentQueryJSON?.hash, [transaction], enters, !enters));
            }
        }
    }

    return result;
}

/** Optimistically patches Your spend snapshot aggregates when a single transaction leaves a report (e.g. delete or reject). */
function getYourSpendSnapshotTransactionRemovalUpdates({transaction, iouReport, currentUserAccountID}: GetYourSpendSnapshotTransactionRemovalUpdatesParams): YourSpendSnapshotOnyxData {
    return getYourSpendSnapshotTransactionMembershipUpdates(transaction, iouReport, currentUserAccountID, false);
}

type GetYourSpendSnapshotReimbursableUpdatesParams = {
    transaction: OnyxEntry<Transaction>;
    updatedTransaction: OnyxEntry<Transaction>;
    iouReport: OnyxEntry<Report>;
    currentUserAccountID: number;
};

/**
 * Optimistically patches Your spend snapshot aggregates when an expense's reimbursable flag is toggled.
 * Your spend counts reimbursable expenses only, so flipping to non-reimbursable removes it from the totals, and flipping back adds it.
 */
function getYourSpendSnapshotReimbursableUpdates({
    transaction,
    updatedTransaction,
    iouReport,
    currentUserAccountID,
}: GetYourSpendSnapshotReimbursableUpdatesParams): YourSpendSnapshotOnyxData {
    const result: YourSpendSnapshotOnyxData = {optimisticData: [], successData: [], failureData: []};
    if (!transaction || !updatedTransaction || !iouReport) {
        return result;
    }

    const wasReimbursable = transaction.reimbursable !== false;
    const willBeReimbursable = updatedTransaction.reimbursable !== false;
    if (wasReimbursable === willBeReimbursable) {
        return result;
    }

    // Match on the transaction that carries the reimbursable state relevant to the section (the reimbursable one), since the scope queries skip non-reimbursable transactions.
    const membershipTransaction = willBeReimbursable ? updatedTransaction : transaction;
    return getYourSpendSnapshotTransactionMembershipUpdates(membershipTransaction, iouReport, currentUserAccountID, willBeReimbursable);
}

/** Optimistically patches Your spend snapshot aggregates when a transaction amount changes. */
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

type GetYourSpendSnapshotSplitUpdatesParams = {
    iouReport: OnyxEntry<Report>;
    originalTransaction: OnyxEntry<Transaction>;
    // Signed change to the report's reimbursable total, in the report currency.
    reimbursableDiff: number;
    // Signed change to the number of reimbursable transactions in the report; drives row visibility in lockstep with the total.
    reimbursableCountDiff: number;
    currentUserAccountID: number;
};

/** Optimistically patches the "Awaiting approval" snapshot when a SUBMITTED expense is split (same-currency only). */
function getYourSpendSnapshotSplitUpdates({
    iouReport,
    originalTransaction,
    reimbursableDiff,
    reimbursableCountDiff,
    currentUserAccountID,
}: GetYourSpendSnapshotSplitUpdatesParams): YourSpendSnapshotOnyxData {
    const result: YourSpendSnapshotOnyxData = {optimisticData: [], successData: [], failureData: []};
    if (!iouReport || !originalTransaction || (reimbursableDiff === 0 && reimbursableCountDiff === 0)) {
        return result;
    }

    const paidGroupPolicyIDs = getPaidGroupPolicyIDs();
    if (!transactionMatchesAwaitingApprovalQuery(iouReport, originalTransaction, currentUserAccountID, paidGroupPolicyIDs)) {
        return result;
    }

    const currency = getCurrency(originalTransaction);
    const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(currentUserAccountID, paidGroupPolicyIDs));
    mergeYourSpendSnapshotOnyxData(result, buildSnapshotTotalUpdatesForHash(approvalQueryJSON?.hash, reimbursableDiff, currency, reimbursableCountDiff));
    return result;
}

export {
    getYourSpendSnapshotReimbursableUpdates,
    getYourSpendSnapshotReportMoveUpdates,
    getYourSpendSnapshotSplitUpdates,
    getYourSpendSnapshotTotalUpdates,
    getYourSpendSnapshotTransactionRemovalUpdates,
    transactionMatchesAwaitingApprovalQuery,
};
