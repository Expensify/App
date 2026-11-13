import {parsePendingNewTransactionFlagKey} from '@libs/PendingNewTransactionFlags';

/**
 * Flags are keyed `transactionID:flaggedAt`, so indexing by a bare transaction ID always yields `undefined` and passes silently.
 * This parses keys the way the rail does, since a transaction ID may contain the separator.
 */
function getFlaggedTransactionIDs(pendingNewTransactionIDs: Record<string, unknown> | undefined): string[] {
    return Object.entries(pendingNewTransactionIDs ?? {})
        .filter(([, isFlagged]) => !!isFlagged)
        .map(([flagKey]) => parsePendingNewTransactionFlagKey(flagKey)?.transactionID)
        .filter((transactionID): transactionID is string => transactionID !== undefined);
}

export default getFlaggedTransactionIDs;
