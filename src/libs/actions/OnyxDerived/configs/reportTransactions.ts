import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportTransactionsDerivedValue} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_TRANSACTIONS,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION],
    compute: ([transactions], {sourceValues, currentValue}) => {
        if (!transactions) {
            return {};
        }

        let data = transactions;
        if (sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION]) {
            data = Object.keys(sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION]).map((key) => transactions[key]);
        }

        return Object.values(data).reduce<ReportTransactionsDerivedValue>((acc, transaction) => {
            const reportID = transaction?.reportID;
            if (!reportID) {
                return acc;
            }

            if (!acc[reportID]) {
                acc[reportID] = [];
            }

            acc[reportID].push(transaction);

            return acc;
        }, currentValue ?? {});
    },
});
