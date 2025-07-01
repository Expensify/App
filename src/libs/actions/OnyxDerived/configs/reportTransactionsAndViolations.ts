import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS],
    compute: ([transactions, violations]) => {
        if (!transactions) {
            return {};
        }

        return Object.entries(transactions).reduce<ReportTransactionsAndViolationsDerivedValue>((acc, [transactionKey, transaction]) => {
            const reportID = transaction?.reportID;
            if (!reportID) {
                return acc;
            }

            if (!acc[reportID]) {
                acc[reportID] = {
                    transactions: {},
                    violations: {},
                };
            }
            const transactionID = transaction.transactionID;
            const transactionViolations = violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
            if (transactionViolations && transactionViolations.length > 0) {
                acc[reportID].violations = {
                    ...acc[reportID].violations,
                    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: transactionViolations,
                };
            }
            acc[reportID].transactions = {
                ...acc[reportID].transactions,
                [transactionKey]: transaction,
            };

            return acc;
        }, {});
    },
});
