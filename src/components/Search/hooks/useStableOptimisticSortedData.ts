import {useEffect, useState} from 'react';
import type {OnyxKey} from 'react-native-onyx';
import type {SearchListItem, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {getOptimisticWatchKey, hasDeferredWrite} from '@libs/deferredLayoutWrite';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

/**
 * Resolves the optimistic watch key from the deferred write channel and
 * synchronizes the mutable ref + React state via requestAnimationFrame.
 *
 * Returns a cleanup function (to cancel the rAF) when a key is found, or
 * `undefined` when no key is available yet.
 */
function resolveWatchKey(tracking: TrackingMutableState, setOptimisticWatchKey: React.Dispatch<React.SetStateAction<OnyxKey | undefined>>): (() => void) | undefined {
    const latestKey = getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
    if (!latestKey) {
        return undefined;
    }
    // eslint-disable-next-line no-param-reassign -- mutable bookkeeping ref is designed to be mutated by tracking helpers
    tracking.optimisticWatchKey = latestKey;
    const rafID = requestAnimationFrame(() => setOptimisticWatchKey(latestKey));
    return () => cancelAnimationFrame(rafID);
}

const OPTIMISTIC_TRACKING_TIMEOUT_MS = 10_000;

// Must be long enough to survive a brief stale-snapshot gap where the server
// snapshot includes the item but the sorted list hasn't caught up yet, yet
// short enough to clean up genuinely rolled-back items promptly.
const OPTIMISTIC_ROLLBACK_GRACE_MS = 3_000;

/**
 * Mutable bookkeeping shared between Phase 1 (`useOptimisticSearchTracking`)
 * and Phase 2 (`useStableOptimisticSortedData`). Grouped into a single ref
 * so ownership is explicit and the cross-hook contract stays narrow.
 */
type TrackingMutableState = {
    /** Whether a deferred write was pending when the search screen mounted. */
    hasPendingWriteOnMount: boolean;
    /** Onyx key of the optimistic transaction being tracked (e.g. `transaction_<id>`). */
    optimisticWatchKey: OnyxKey | undefined;
    /** Cached optimistic list item used to re-inject during stale-snapshot gaps. */
    cachedOptimisticItem: TransactionListItemType | null;
    /** Index at which the cached item was last seen in sortedData. */
    cachedOptimisticItemIndex: number;
    /** Whether the optimistic lifecycle has been terminated (cleared). */
    isCleanedUp: boolean;
    /** Whether we already swapped from a split-parent key to the child key. */
    hasSwappedFromParent: boolean;
    /** Timeout handle for the rollback grace period before final cleanup. */
    rollbackTimeout: ReturnType<typeof setTimeout> | undefined;
};

type OptimisticTrackingState = {
    /** Single ref holding all mutable bookkeeping for the optimistic lifecycle. */
    mutableRef: React.RefObject<TrackingMutableState>;
    /** Current resolved Onyx key being watched for the optimistic item. */
    optimisticWatchKey: OnyxKey | undefined;
    /** Whether optimistic tracking has been fully cleared (lifecycle ended). */
    isOptimisticTrackingCleared: boolean;
    /** Terminates optimistic tracking and resets all related state. */
    clearOptimisticTracking: () => void;
    /** Controls visibility of the skeleton placeholder row in the search list. */
    setShowPendingExpensePlaceholder: React.Dispatch<React.SetStateAction<boolean>>;
    /** Setter for the reactive optimistic watch key state. */
    setOptimisticWatchKey: React.Dispatch<React.SetStateAction<OnyxKey | undefined>>;
};

/**
 * Phase 2: Call this hook AFTER computing sortedData.
 *
 * Tracks the optimistic item through its lifecycle in sortedData and produces
 * a stableSortedData array that re-injects the cached item if a stale snapshot
 * temporarily removes it.
 *
 * Shares mutable refs with Phase 1 (`useOptimisticSearchTracking`) via a single
 * `mutableRef` to keep the cross-hook contract narrow and ownership explicit.
 */
function useStableOptimisticSortedData(sortedData: SearchListItem[], searchResults: SearchResults | undefined, state: OptimisticTrackingState) {
    const {mutableRef, optimisticWatchKey, isOptimisticTrackingCleared, clearOptimisticTracking, setShowPendingExpensePlaceholder, setOptimisticWatchKey} = state;

    const [cachedItem, setCachedItem] = useState<TransactionListItemType | null>(null);
    const [cachedItemIndex, setCachedItemIndex] = useState(0);

    useEffect(() => {
        const tracking = mutableRef.current;
        if (!tracking.hasPendingWriteOnMount || tracking.isCleanedUp) {
            return;
        }

        // Flush stale cached item from a previous lifecycle after re-arm.
        // rearmTracking() clears the ref but can't reach this hook's state.
        if (!tracking.cachedOptimisticItem && cachedItem) {
            setCachedItem(null);
            return;
        }

        if (!tracking.optimisticWatchKey) {
            const cleanup = resolveWatchKey(tracking, setOptimisticWatchKey);
            if (!cleanup && !hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)) {
                clearOptimisticTracking();
            }
            return cleanup;
        }

        const watchKey = tracking.optimisticWatchKey;
        const optimisticItem = sortedData.find((item): item is TransactionListItemType => 'transactionID' in item && `${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}` === watchKey);
        const isOptimisticItemInSearchSnapshot = !!watchKey && !!searchResults?.data?.[watchKey as `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`];
        if (optimisticItem) {
            if (tracking.rollbackTimeout) {
                clearTimeout(tracking.rollbackTimeout);
                tracking.rollbackTimeout = undefined;
            }
            if (!tracking.cachedOptimisticItem) {
                setShowPendingExpensePlaceholder(false);
            }
            const itemIndex = sortedData.indexOf(optimisticItem);
            tracking.cachedOptimisticItem = optimisticItem;
            tracking.cachedOptimisticItemIndex = itemIndex;
            setCachedItem(optimisticItem);
            setCachedItemIndex(itemIndex);

            if (optimisticItem.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && isOptimisticItemInSearchSnapshot) {
                clearOptimisticTracking();
                setCachedItem(null);
            }
        } else if (tracking.cachedOptimisticItem && !tracking.rollbackTimeout) {
            tracking.rollbackTimeout = setTimeout(() => {
                tracking.rollbackTimeout = undefined;
                clearOptimisticTracking();
                setCachedItem(null);
            }, OPTIMISTIC_ROLLBACK_GRACE_MS);
        }
    }, [sortedData, clearOptimisticTracking, searchResults?.data, mutableRef, setShowPendingExpensePlaceholder, setOptimisticWatchKey, cachedItem]);

    const stableSortedData = (() => {
        if (isOptimisticTrackingCleared || !cachedItem || !optimisticWatchKey) {
            return sortedData;
        }
        const isStillInList = sortedData.some((item) => 'transactionID' in item && `${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}` === optimisticWatchKey);
        if (isStillInList) {
            return sortedData;
        }
        const insertAt = Math.min(cachedItemIndex, sortedData.length);
        const result = [...sortedData];
        result.splice(insertAt, 0, cachedItem);
        return result;
    })();

    return {stableSortedData, hasCachedOptimisticItem: !!cachedItem};
}

export default useStableOptimisticSortedData;
export {OPTIMISTIC_TRACKING_TIMEOUT_MS, resolveWatchKey};
export type {OptimisticTrackingState, TrackingMutableState};
