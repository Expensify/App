import {isDeletedTransaction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useCallback} from 'react';

import useOnyx from './useOnyx';

type CarouselTransactionIDs = {
    /** The seeded carousel IDs, minus the expenses that are gone */
    transactionIDs: string[];

    /** The search snapshot the carousel was seeded from, when it was seeded from one */
    snapshot: OnyxEntry<OnyxTypes.SearchResults>;
};

/**
 * The expenses the prev/next carousel can actually page through.
 *
 * The seeded list is a copy of what some other screen was showing, and it goes stale: deleting an expense leaves
 * its ID behind, so the counter keeps counting it and its arrow leads to a "not here" page. Validating here is
 * what keeps the two in agreement, rather than trying to keep every writer perfectly in step.
 *
 * The header and the carousel both have to decide whether there is a carousel to show, and they have to reach the
 * same answer from the same list. When the header decided from the raw list and the carousel from this filtered
 * one, the header could pick the expense carousel while the carousel itself rendered nothing, which left the user
 * with no arrows at all because the report carousel sits in the other branch of that choice.
 */
function useCarouselTransactionIDs(): CarouselTransactionIDs {
    const [seededTransactionIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    // When the carousel is opened from a search (e.g. the Spend page), the sibling transactions may only exist
    // in the search snapshot and not in the live collection yet. We keep the snapshot around to fall back to it
    // so prev/next navigation resolves the correct report instead of breaking.
    // `useOnyx`'s automatic snapshot redirection doesn't cover this: it only kicks in inside `SearchScopeProvider`
    // (which wraps the search list, not the RHP this header renders in), it reads the *currently displayed*
    // search hash rather than the one the carousel was seeded from, and it returns snapshot data *instead of*
    // live data, whereas here live data has to win over the snapshot.
    const [snapshotHash] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH);
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`);

    const validTransactionIDsSelector = useCallback(
        (allTransactions: OnyxCollection<OnyxTypes.Transaction>) =>
            seededTransactionIDs.filter((transactionID) => {
                const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
                const transaction = allTransactions?.[key] ?? snapshot?.data?.[key];
                // An unknown transaction is one that hasn't loaded yet, not one that is gone. Dropping those would
                // shrink the carousel under the user on a cold open.
                if (!transaction) {
                    return true;
                }
                return !isTransactionPendingDelete(transaction) && !isDeletedTransaction(transaction);
            }),
        [seededTransactionIDs, snapshot],
    );
    const [transactionIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: validTransactionIDsSelector});

    return {transactionIDs, snapshot};
}

export default useCarouselTransactionIDs;
