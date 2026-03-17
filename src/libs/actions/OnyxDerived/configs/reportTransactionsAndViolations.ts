import type {OnyxCollection} from 'react-native-onyx';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';

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
            const previousReportID = transactionReportIDMapping[transactionKey];

            if (previousReportID && previousReportID !== reportID && reportTransactionsAndViolations[previousReportID]) {
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
