import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

let previousViolations: OnyxCollection<TransactionViolation[]> = {};
const transactionReportIDMapping: Record<string, string> = {};

const transactionToReportIDMap: Record<string, string> = {};

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS],
    compute: ([transactions, violations], {sourceValues, currentValue}) => {
        if (!transactions) {
            return {};
        }

        // If there is a source value for transactions or transaction violations, we need to process only the transactions that have been updated or added
        // If not, we need to process all transactions
        const transactionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];
        const transactionViolationsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS];
        let transactionsToProcess = Object.keys(transactions);
        // When we have a delta, process the union of transactions that changed directly and transactions
        // whose violations changed. Coalescing can put both in the same flush, so an `if/else` would drop
        // the second trigger (e.g. a transaction change for A batched with a violations change for B).
        if (transactionsUpdates || transactionViolationsUpdates) {
            const transactionKeys = new Set<string>();
            for (const transactionKey of Object.keys(transactionsUpdates ?? {})) {
                transactionKeys.add(transactionKey);
            }
            for (const transactionViolationKey of Object.keys(transactionViolationsUpdates ?? {})) {
                transactionKeys.add(transactionViolationKey.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION));
            }
            transactionsToProcess = Array.from(transactionKeys);
        }

        const reportTransactionsAndViolations = currentValue ? {...currentValue} : {};

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

        for (const transactionKey of transactionsToProcess) {
            const transaction = transactions[transactionKey];
            const reportID = transaction?.reportID;

            // If the reportID of the transaction has changed (e.g. the transaction was split into multiple reports), we need to delete the transaction from the previous reportID and the violations from the previous reportID
            const previousReportID = transactionReportIDMapping[transactionKey];

            if (previousReportID && previousReportID !== reportID && reportTransactionsAndViolations[previousReportID]) {
                ensureCloned(previousReportID);
                delete reportTransactionsAndViolations[previousReportID].transactions[transactionKey];
                const transactionID = transactionKey.replace(ONYXKEYS.COLLECTION.TRANSACTION, '');
                if (transactionID) {
                    delete reportTransactionsAndViolations[previousReportID].violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
                }
            }

            if (!transaction && transactionReportIDMapping[transactionKey]) {
                delete transactionReportIDMapping[transactionKey];
            }

            if (!reportID) {
                delete transactionToReportIDMap[transactionKey];
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

            // If violations exist and have length > 0, add them to the structure
            if (transactionViolations && transactionViolations.length > 0) {
                reportTransactionsAndViolations[reportID].violations[violationKey] = transactionViolations;
            } else if (violationInSourceValues === undefined || (previousTransactionViolations && previousTransactionViolations.length > 0)) {
                // If violations were removed (previous had violations but current doesn't) or explicitly set to undefined, remove them from the structure
                delete reportTransactionsAndViolations[reportID].violations[violationKey];
            }

            reportTransactionsAndViolations[reportID].transactions[transactionKey] = transaction;
            transactionReportIDMapping[transactionKey] = reportID;
        }

        previousViolations = violations;

        return reportTransactionsAndViolations;
    },
});
