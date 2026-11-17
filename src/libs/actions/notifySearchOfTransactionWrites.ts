/**
 * Tells Search which transactions just changed on the server, so it can refetch the values only the server computes
 * (footer totals, row actions, filter membership). Fed by successful user writes and by Pusher updates.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

// Two changes can touch the same transactions, and Onyx skips a set whose value did not change.
let writeID = 0;

function notifySearchOfTransactionWrites(updates: ReadonlyArray<{key: string}> | undefined) {
    const transactionIDs = new Set<string>();
    for (const update of updates ?? []) {
        if (update.key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            transactionIDs.add(update.key.slice(ONYXKEYS.COLLECTION.TRANSACTION.length));
        }
    }
    if (transactionIDs.size === 0) {
        return;
    }

    writeID += 1;
    Onyx.set(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES, {transactionIDs: [...transactionIDs], writeID});
}

export default notifySearchOfTransactionWrites;
