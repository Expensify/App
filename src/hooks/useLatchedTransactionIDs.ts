import {useState} from 'react';
import CONST from '@src/CONST';

type LatchInputTransaction = {
    transactionID: string;
    pendingAction?: string | null;
};

/**
 * Snapshots stable (non-pending) transaction IDs when an optimistic-add appears, locking
 * `transactions.length`-driven layout decisions across the Duplicate flow. Transparent during
 * hydration so real-time pushes aren't masked. `resetKey` (typically the report ID) releases
 * the latch when the same screen instance is reused for a different report via setParams.
 */
function useLatchedTransactionIDs(transactions: readonly LatchInputTransaction[] | undefined, resetKey?: string): Set<string> | undefined {
    const [latched, setLatched] = useState<{key: string | undefined; ids: Set<string>} | undefined>(undefined);
    const hasOptimisticAdd = transactions?.some((t) => t.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) ?? false;
    const keyChanged = latched !== undefined && latched.key !== resetKey;

    if (keyChanged) {
        setLatched(undefined);
    } else if (hasOptimisticAdd && latched === undefined && transactions) {
        const stableIds = new Set(
            transactions
                .filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                .map((t) => t.transactionID),
        );
        if (stableIds.size > 0) {
            setLatched({key: resetKey, ids: stableIds});
        }
    } else if (latched !== undefined) {
        // Release if any latched ID disappears or is pending deletion; consumer's filter would otherwise empty and flip layout.
        const liveIDs = new Set(transactions?.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).map((t) => t.transactionID) ?? []);
        let anyMissing = false;
        for (const id of latched.ids) {
            if (!liveIDs.has(id)) {
                anyMissing = true;
                break;
            }
        }
        if (anyMissing) {
            setLatched(undefined);
        }
    }

    return latched?.ids;
}

export default useLatchedTransactionIDs;
