import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import {getLength as getPersistedRequestsLength, getQueuedRequestsCount} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';

import type Middleware from './types';

/**
 * Queries (the `jsonQuery` sent to the backend) of the in-flight searches whose snapshot is dropped if a write was queued
 * while they were in flight, each mapped to how many requests had been queued when it was guarded. The query is keyed
 * rather than the hash because it holds the offset: several pages of one hash can be in flight at once, and only the
 * search that asked for the guard may have its snapshot dropped.
 */
const guardedSearchQueries = new Map<string, number>();

/** Queries of the guarded searches whose snapshot was dropped, so the search knows to run again once the writes land. */
const discardedSearchQueries = new Set<string>();

/**
 * Guards a search that has just waited for the write queue to go idle. Any write queued after this point was queued
 * while it was in flight, so its response predates that write and is stale, even if the write finishes first.
 */
function guardSearchAgainstStaleSnapshot(jsonQuery: string) {
    guardedSearchQueries.set(jsonQuery, getQueuedRequestsCount());
    discardedSearchQueries.delete(jsonQuery);
}

/** Stops guarding the search and returns whether its snapshot was dropped. */
function releaseStaleSnapshotGuard(jsonQuery: string): boolean {
    guardedSearchQueries.delete(jsonQuery);
    return discardedSearchQueries.delete(jsonQuery);
}

/**
 * Inline edits write their optimistic values into the Search snapshot. A search sent before such an edit returns the
 * server's values from before it, and applying that snapshot flips the edited cell back to its old value until the
 * edit's write finishes and another search corrects it. This drops the snapshot from a guarded search's response
 * when a write was queued while it was in flight, so the optimistic values stay on screen, and the search runs again
 * once the writes land.
 */
const discardStaleSearchSnapshot: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const hash = request?.data?.hash;
        const jsonQuery = request?.data?.jsonQuery;
        const queuedRequestsCountWhenGuarded = typeof jsonQuery === 'string' ? guardedSearchQueries.get(jsonQuery) : undefined;
        if (request?.command !== READ_COMMANDS.SEARCH || typeof hash !== 'number' || typeof jsonQuery !== 'string' || queuedRequestsCountWhenGuarded === undefined || !response?.onyxData) {
            return response;
        }

        // The write can finish and leave the queue before this response arrives, so pending writes alone would miss it.
        const writesQueuedSinceGuard = getQueuedRequestsCount() - queuedRequestsCountWhenGuarded;
        const pendingWrites = getPersistedRequestsLength();
        if (writesQueuedSinceGuard <= 0 && pendingWrites === 0) {
            return response;
        }

        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`;
        discardedSearchQueries.add(jsonQuery);
        Log.info('[DiscardStaleSearchSnapshot] Dropping the snapshot of a search that writes were queued behind', false, {hash, writesQueuedSinceGuard, pendingWrites});
        return {...response, onyxData: response.onyxData.filter((update) => update.key !== snapshotKey)};
    });

export default discardStaleSearchSnapshot;
export {guardSearchAgainstStaleSnapshot, releaseStaleSnapshotGuard};
