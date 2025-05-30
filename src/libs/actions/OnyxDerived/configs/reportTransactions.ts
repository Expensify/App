import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportTransactionsDerivedValue} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_TRANSACTIONS,
    dependencies: [ONYXKEYS.COLLECTION.TRANSACTION],
    compute: ([transactions]) => {
        if (!transactions) {
            return {};
        }

        return Object.values(transactions).reduce<ReportTransactionsDerivedValue>((acc, transaction) => {
            const reportID = transaction?.reportID;
            if (!reportID) {
                return acc;
            }

            if (!acc[reportID]) {
                acc[reportID] = [];
            }

            acc[reportID].push(transaction);

            return acc;
        }, {});
    },
});
