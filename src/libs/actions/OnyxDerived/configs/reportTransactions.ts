import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportTransactionsDerivedValue} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_TRANSACTIONS,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS],
    compute: ([transactions, violations], {sourceValues}) => {
        if (!transactions) {
            return {};
        }

        let data = transactions;
        if (sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION]) {
            data = Object.keys(sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION]).map((key) => transactions[key]);
        }
        if (sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]) {
            data = Object.keys(sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]).map(
                (key) => transactions[key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION)],
            );
        }

        return Object.values(data).reduce<ReportTransactionsDerivedValue>((acc, transaction) => {
            const reportID = transaction?.reportID;
            if (!reportID) {
                return acc;
            }

            if (!acc[reportID]) {
                acc[reportID] = [];
            }

            const transactionID = transaction.transactionID;
            const violationsForTransaction = violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
            acc[reportID].push({...transaction, violations: violationsForTransaction});

            return acc;
        }, {});
    },
});
