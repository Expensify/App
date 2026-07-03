import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

let previousViolations: OnyxCollection<TransactionViolation[]> = {};
const transactionReportIDMapping: Record<string, string> = {};

const getTransactionKeyFromViolationKey = (violationKey: string) => violationKey.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION);

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS],
    compute: ([transactions, violations], context) => {
        const {sourceValues, currentValue} = context;

        // If there is a source value for transactions or transaction violations, we need to process only the transactions that have been updated or added
        // If not, we need to process all transactions
        const transactionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];
        const transactionViolationsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS];
        const isPartialUpdate = !!transactionsUpdates || !!transactionViolationsUpdates;
        // Full recomputes should rebuild from the transaction source so stale derived buckets or deleted transactions are not carried forward.
        // Partial updates still start from currentValue so violation-only refreshes can preserve report membership when this tab has an incomplete transaction snapshot.
        const reportTransactionsAndViolations = isPartialUpdate && currentValue ? {...currentValue} : {};

        if (context.isInitialDependencyLoad && currentValue) {
            previousViolations = violations;
            context.shouldSkipUpdate = true;
            return currentValue;
        }

        if (!transactions) {
            if (transactionViolationsUpdates) {
                context.shouldSkipUpdate = true;
                return reportTransactionsAndViolations;
            }
            return {};
        }

        let transactionsToProcess = Object.keys(transactions);
        if (transactionsUpdates) {
            transactionsToProcess = Object.keys(transactionsUpdates);
        } else if (transactionViolationsUpdates) {
            transactionsToProcess = Object.keys(transactionViolationsUpdates).map(getTransactionKeyFromViolationKey);
        }

        // Track which reportID entries have been cloned so we only clone once per reportID.
        // This avoids mutating nested objects that are still referenced by the cached value.
        const clonedReportIDs = new Set<string>();
        const ensureCloned = (id: string) => {
            if (clonedReportIDs.has(id) || !reportTransactionsAndViolations[id]) {
                return;
            }

            reportTransactionsAndViolations[id] = {
                transactions: {...reportTransactionsAndViolations[id].transactions},
                violations: {...reportTransactionsAndViolations[id].violations},
            };
            clonedReportIDs.add(id);
        };

        const getPreviousReportID = (transactionKey: string) =>
            transactionReportIDMapping[transactionKey] ??
            Object.keys(reportTransactionsAndViolations).find((reportID) => !!reportTransactionsAndViolations[reportID].transactions[transactionKey]);

        // Empty buckets carry no derived data and can make deleted reports appear again.
        const deleteReportIfEmpty = (reportID: string | undefined) => {
            if (!reportID || !reportTransactionsAndViolations[reportID]) {
                return;
            }

            if (Object.keys(reportTransactionsAndViolations[reportID].transactions).length > 0 || Object.keys(reportTransactionsAndViolations[reportID].violations).length > 0) {
                return;
            }

            delete reportTransactionsAndViolations[reportID];
            clonedReportIDs.delete(reportID);
        };

        if (!isPartialUpdate) {
            for (const transactionKey of Object.keys(transactionReportIDMapping)) {
                delete transactionReportIDMapping[transactionKey];
            }
        } else {
            for (const reportID of Object.keys(reportTransactionsAndViolations)) {
                deleteReportIfEmpty(reportID);
            }
        }

        if (!transactionsUpdates && transactionViolationsUpdates) {
            transactionsToProcess = transactionsToProcess.filter((transactionKey) => {
                return !!transactions[transactionKey];
            });

            if (transactionsToProcess.length === 0) {
                context.shouldSkipUpdate = true;
                return reportTransactionsAndViolations;
            }
        }

        for (const transactionKey of transactionsToProcess) {
            // If the reportID of the transaction has changed (e.g. the transaction was split into multiple reports), we need to delete the transaction from the previous reportID and the violations from the previous reportID
            const previousReportID = getPreviousReportID(transactionKey);
            const transactionWasUpdated = !!transactionsUpdates;
            const transaction = transactions[transactionKey];
            const reportID = transaction?.reportID;

            if (transactionWasUpdated && previousReportID && previousReportID !== reportID && reportTransactionsAndViolations[previousReportID]) {
                ensureCloned(previousReportID);
                delete reportTransactionsAndViolations[previousReportID].transactions[transactionKey];
                const transactionID = transactionKey.replace(ONYXKEYS.COLLECTION.TRANSACTION, '');
                if (transactionID) {
                    delete reportTransactionsAndViolations[previousReportID].violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
                }
                deleteReportIfEmpty(previousReportID);
            }

            if (transactionWasUpdated && !transaction && transactionReportIDMapping[transactionKey]) {
                delete transactionReportIDMapping[transactionKey];
            }

            if (!reportID) {
                continue;
            }

            if (!reportTransactionsAndViolations[reportID]) {
                reportTransactionsAndViolations[reportID] = {
                    transactions: {},
                    violations: {},
                };
                clonedReportIDs.add(reportID);
            } else {
                ensureCloned(reportID);
            }

            const transactionID = transaction.transactionID;
            const violationKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`;
            const transactionViolations = violations?.[violationKey];
            const previousTransactionViolations = previousViolations?.[violationKey];

            const violationInSourceValues = transactionViolationsUpdates?.[violationKey];
            const hasExplicitViolationClear = Array.isArray(violationInSourceValues) && violationInSourceValues.length === 0;

            // If violations exist and have length > 0, add them to the structure
            if (transactionViolations && transactionViolations.length > 0) {
                reportTransactionsAndViolations[reportID].violations[violationKey] = transactionViolations;
            } else if (violationInSourceValues === undefined || hasExplicitViolationClear || (previousTransactionViolations && previousTransactionViolations.length > 0)) {
                // If violations were removed (previous had violations but current doesn't) or explicitly set to undefined, remove them from the structure
                delete reportTransactionsAndViolations[reportID].violations[violationKey];
            }

            reportTransactionsAndViolations[reportID].transactions[transactionKey] = transaction;
            transactionReportIDMapping[transactionKey] = reportID;
        }

        previousViolations = violations;

        for (const reportID of Object.keys(reportTransactionsAndViolations)) {
            deleteReportIfEmpty(reportID);
        }

        return reportTransactionsAndViolations;
    },
});
