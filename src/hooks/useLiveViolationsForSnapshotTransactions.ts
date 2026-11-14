/** Reads scoped, authoritative live violation entries for snapshot and hydrated expenses. */
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import {transactionViolationsByIDsSelector} from '@selectors/TransactionViolations';
// eslint-disable-next-line no-restricted-imports -- Live empty arrays must override stale Search snapshot warnings.
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

function useLiveViolationsForSnapshotTransactions(snapshotTransactions: Transaction[] | undefined, liveTransactions: Transaction[]) {
    const transactionIDs = [...new Set([...(snapshotTransactions ?? []), ...liveTransactions].map((transaction) => transaction.transactionID))];
    const [violations] = useOnyxWithoutSnapshots(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: transactionViolationsByIDsSelector(transactionIDs),
    });
    return violations;
}

export default useLiveViolationsForSnapshotTransactions;
