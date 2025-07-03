import type {OnyxCollection} from 'react-native-onyx';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

let previousTransactions: OnyxCollection<Transaction> = {};

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS],
    compute: ([transactions, violations], {sourceValues, currentValue}) => {
        if (!transactions) {
            return {};
        }

        const transactionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];
        const transactionViolationsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS];
        let transactionsToProcess = Object.keys(transactions);
        if (transactionsUpdates) {
            transactionsToProcess = Object.keys(transactionsUpdates);
        } else if (transactionViolationsUpdates) {
            transactionsToProcess = Object.keys(transactionViolationsUpdates).map((transactionViolation) =>
                transactionViolation.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION),
            );
        }

        const reportTransactionsAndViolations = currentValue ?? {};
        for (const transactionKey of transactionsToProcess) {
            const transaction = transactions[transactionKey];
            const reportID = transaction?.reportID;

            // If the reportID of the transaction has changed (e.g. the transaction was split into multiple reports), we need to delete the transaction from the previous reportID and the violations from the previous reportID
            const previousTransaction = previousTransactions?.[transactionKey];
            const previousReportID = previousTransaction?.reportID;

            if (previousReportID && previousReportID !== reportID && reportTransactionsAndViolations[previousReportID]) {
                delete reportTransactionsAndViolations[previousReportID].transactions[transactionKey];
                const transactionID = previousTransaction?.transactionID;
                if (transactionID) {
                    delete reportTransactionsAndViolations[previousReportID].violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
                }
            }

            if (!reportID) {
                // eslint-disable-next-line no-continue
                continue;
            }

            if (!reportTransactionsAndViolations[reportID]) {
                reportTransactionsAndViolations[reportID] = {
                    transactions: {},
                    violations: {},
                };
            }

            const transactionID = transaction.transactionID;
            const transactionViolations = violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];

            if (transactionViolations && transactionViolations.length > 0) {
                reportTransactionsAndViolations[reportID].violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] = transactionViolations;
            }

            reportTransactionsAndViolations[reportID].transactions[transactionKey] = transaction;
        }

        previousTransactions = transactions;

        return reportTransactionsAndViolations;
    },
});
