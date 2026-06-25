import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
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
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

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
    const search = currentSnapshot?.search;

    // Only bail when the snapshot hasn't been loaded at all — writing into a non-existent snapshot would create a
    // partial/garbage entry. A loaded-but-empty snapshot (e.g. the section had nothing awaiting approval, so its
    // `total`/`count`/`currency` are still null) is a valid zero base: the first report submitted offline should
    // populate and reveal the row.
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
                        // Restore the exact prior state. When the section was empty these were null, so rolling back
                        // to null (Onyx MERGE removes the key) cleanly re-hides the row.
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

    // A currency change can't be expressed as a simple amount delta on the snapshot total without converting between
    // currencies, and FX rates aren't available offline (totals are converted server-side). Skip patching in that case.
    if (currentCurrency !== updatedCurrency) {
        return null;
    }

    // Signed to match the snapshot `total` convention (spend negative, credits positive), so the delta moves the
    // snapshot total in the correct direction (e.g. raising a spend amount makes the negative total more negative).
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
    return allSnapshots?.[snapshotKey]?.search;
}

/**
 * Returns a transaction's reimbursable amount in the snapshot currency, or null when conversion is unavailable offline.
 * The value is signed to match the search `total` convention (spend is negative, credits positive), i.e. it mirrors
 * `getAmount(transaction, isFromExpenseReport)` rather than its magnitude.
 */
function getReimbursableTransactionAmountInCurrency(transaction: Transaction, iouReport: OnyxEntry<Report>, targetCurrency: string): number | null {
    const isExpenseReportLocal = isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport);
    const transactionCurrency = getCurrency(transaction);

    if (transactionCurrency === targetCurrency) {
        return getAmount(transaction, isExpenseReportLocal);
    }
    // `convertedAmount` is denominated in the report's policy output currency, not necessarily the snapshot
    // currency. Only trust it when those match; otherwise we'd add a value in the wrong currency to the total.
    const policyOutputCurrency = iouReport?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${iouReport.policyID}`]?.outputCurrency : undefined;
    if (transaction.convertedAmount != null && policyOutputCurrency === targetCurrency) {
        return getConvertedAmount(transaction, isExpenseReportLocal);
    }

    return null;
}

type ReportReimbursableAggregate = {
    total: number;
    // Number of reimbursable transactions contributing to `total`. Kept alongside `total` so the snapshot's
    // result `count` can be patched in lockstep when the report enters or leaves a Your spend section.
    count: number;
    // The reimbursable transactions that contributed to `total`. The Home row reads its amount from
    // `snapshot.search.total`, but the Search page renders its list from `snapshot.data`. These are injected into
    // `data` so an offline-submitted report's expenses are visible when the user opens the section offline.
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
        transactions.push(reportTransaction);
    }

    return {total, count, transactions};
}

/**
 * Builds the snapshot `data` writes that add (or remove) a report's reimbursable transactions when it enters (or
 * leaves) a Your spend section. The Home row only needs `search.total`/`count`, but the Search page the row links to
 * renders its list from `snapshot.data`; without these writes an offline-submitted report's section opens empty.
 */
function buildSnapshotDataUpdatesForHash(snapshotHash: number | undefined, transactions: Transaction[], enters: boolean, leaves: boolean): YourSpendSnapshotOnyxData {
    // Only a section crossing (enter XOR leave) changes membership. Staying put, or no transactions, is a no-op.
    if (!snapshotHash || transactions.length === 0 || enters === leaves) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as const;
    // Only patch a snapshot that's actually been loaded; writing into a missing one would create a partial entry.
    if (!allSnapshots?.[snapshotKey]?.search) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const presentData: SearchResultDataType = {};
    const absentData: NullishDeep<SearchResultDataType> = {};
    for (const transaction of transactions) {
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}` as const;
        presentData[transactionKey] = transaction;
        absentData[transactionKey] = null;
    }

    // Entering adds the transactions (rollback removes them); leaving removes them (rollback restores them).
    const optimisticDataValue = enters ? presentData : absentData;
    const failureDataValue = enters ? absentData : presentData;

    return {
        optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: snapshotKey, value: {data: optimisticDataValue}}],
        successData: [],
        failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: snapshotKey, value: {data: failureDataValue}}],
    };
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
    const approvalSnapshotSearch = getSnapshotSearchResults(approvalQueryJSON?.hash);
    const approvalSnapshotCurrency = approvalSnapshotSearch?.currency;
    // When the section is currently empty its snapshot has no currency yet, so fall back to the report's currency.
    // This lets the first report submitted offline populate (and reveal) the row; the backend corrects the
    // currency/total on the next online refresh.
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

type GetYourSpendSnapshotSplitUpdatesParams = {
    iouReport: OnyxEntry<Report>;
    originalTransaction: OnyxEntry<Transaction>;
    // Signed change to the report's reimbursable total, in the transaction/report currency
    // (new split total minus the pre-split total). Negative when the expense is split to a lower amount.
    reimbursableDiff: number;
    // Signed change to the number of reimbursable transactions in the report caused by the split
    // (e.g. splitting one expense into two reimbursable children is +1). `count` drives the Home row's
    // visibility, so it must move in lockstep with the membership change even when `reimbursableDiff` is 0
    // (an equal-amount split leaves the total unchanged but still adds transactions).
    reimbursableCountDiff: number;
    currentUserAccountID: number;
};

/**
 * Optimistically patches the "Awaiting approval" snapshot when a SUBMITTED expense is split. A split keeps the report
 * in the awaiting-approval section but changes both its reimbursable total (e.g. split to a lower amount) and the number
 * of reimbursable transactions it contains (one expense becomes several). Home reads `snapshot.search.total`/`count`,
 * which are only refreshed online, and `count` drives the row's visibility — so both must be patched, even when the
 * total is unchanged (an equal-amount split still changes `count`). Mirrors the amount-edit path: same-currency only
 * (the currency guard in `buildSnapshotTotalUpdatesForHash` skips a mismatch, since FX conversion isn't available offline).
 */
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
    getYourSpendSnapshotReportMoveUpdates,
    getYourSpendSnapshotSplitUpdates,
    getYourSpendSnapshotTotalUpdates,
    getYourSpendSnapshotTransactionRemovalUpdates,
    transactionMatchesAwaitingApprovalQuery,
};
