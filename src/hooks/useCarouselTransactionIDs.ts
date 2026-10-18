import {isDeletedTransaction, isSplitContainerTransaction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

type CarouselTransactionIDs = {
    /** The seeded carousel IDs, minus the expenses that are gone */
    transactionIDs: string[];

    /** The search snapshot the carousel was seeded from, when it was seeded from one */
    snapshot: OnyxEntry<OnyxTypes.SearchResults>;

    /**
     * Whether every source this list is derived from has reported yet.
     *
     * Consumers that act on *how many* siblings exist rather than on which ones do have to wait for it. The
     * selector below reads four separate sources - the seed, the snapshot hash, the snapshot, and the sibling
     * descriptors - and drops a sibling that none of them can vouch for. While any of them is still loading that
     * drop is indistinguishable from a report that genuinely has one expense, so counting the result early sends
     * the caller to the wrong conclusion. `transactionIDs` falls back to the raw seed while this is set, which is
     * the length the arrows used before the filter existed.
     */
    isLoading: boolean;
};

function useCarouselTransactionIDs(): CarouselTransactionIDs {
    const [seededTransactionIDs = getEmptyArray<string>(), seededIDsMetadata] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    const [snapshotHash, snapshotHashMetadata] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH);
    const [snapshot, snapshotMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`);
    const [siblingDescriptors, descriptorsMetadata] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS);

    const validTransactionIDsSelector = (allTransactions: OnyxCollection<OnyxTypes.Transaction>) =>
        seededTransactionIDs.filter((transactionID) => {
            const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;

            // A live `null` means the expense was deleted, so don't let the stale snapshot copy bring it back.
            const liveTransaction = allTransactions?.[key];
            if (liveTransaction === null) {
                return false;
            }

            // A sibling that hasn't landed in the live collection yet (snapshot-backed flows) is read from the snapshot instead.
            const transaction = liveTransaction ?? snapshot?.data?.[key];

            if (!transaction) {
                // Nothing to inspect, so keep the ID only while a descriptor still vouches for the sibling.
                return !!siblingDescriptors?.[transactionID];
            }

            // Splitting moves the original into the hidden split report, which has no screen of its own, but it
            // leaves that original in any carousel seeded from the report it was on. The splits it created were
            // never part of that carousel, so deleting them changes nothing: the seed keeps paging through two
            // while the report shows one, and the arrow resolves the original against a report that cannot be
            // opened. Drop it here instead of trusting the seed to still describe the report.
            //
            // Deriving this rather than writing it is what keeps it honest: a split the server rejects puts the
            // original's real reportID back, and its arrow comes back on its own.
            if (isSplitContainerTransaction(transaction)) {
                return false;
            }

            return !isTransactionPendingDelete(transaction) && !isDeletedTransaction(transaction);
        });
    const [validTransactionIDs = getEmptyArray<string>(), transactionsMetadata] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: validTransactionIDsSelector});

    // Every input the selector reads has to have reported before its answer can be trusted, not just the
    // transaction collection: a sibling that only the snapshot or a descriptor vouches for is dropped while that
    // source is still loading, which reads exactly like a report that is down to one expense.
    const isLoading = isLoadingOnyxValue(seededIDsMetadata, snapshotHashMetadata, snapshotMetadata, descriptorsMetadata, transactionsMetadata);

    return {transactionIDs: isLoading ? seededTransactionIDs : validTransactionIDs, snapshot, isLoading};
}

export default useCarouselTransactionIDs;
