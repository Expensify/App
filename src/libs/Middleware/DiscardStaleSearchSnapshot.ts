import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import {getLength as getPersistedRequestsLength} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';

import type Middleware from './types';

/** Hashes of the in-flight searches whose snapshot is dropped if a write was queued while they were in flight. */
const guardedSearchHashes = new Set<number>();

/** Hashes of the guarded searches whose snapshot was dropped, so the search knows to run again once the writes land. */
const discardedSearchHashes = new Set<number>();

/**
 * Guards a search that has just waited for the write queue to go idle. Any write still pending when its response
 * arrives was queued while it was in flight, so the response predates that write and is stale.
 */
function guardSearchAgainstStaleSnapshot(hash: number) {
    guardedSearchHashes.add(hash);
    discardedSearchHashes.delete(hash);
}

/** Stops guarding the search and returns whether its snapshot was dropped. */
function releaseStaleSnapshotGuard(hash: number): boolean {
    guardedSearchHashes.delete(hash);
    return discardedSearchHashes.delete(hash);
}

/**
 * Inline edits write their optimistic values into the Search snapshot. A search sent before such an edit returns the
 * server's values from before it, and applying that snapshot flips the edited cell back to its old value until the
 * edit's write finishes and another search corrects it. This drops the snapshot from a guarded search's response
 * while writes are pending, so the optimistic values stay on screen, and the search runs again once the writes land.
 */
const discardStaleSearchSnapshot: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const hash = request?.data?.hash;
        if (request?.command !== READ_COMMANDS.SEARCH || typeof hash !== 'number' || !guardedSearchHashes.has(hash) || !response?.onyxData || getPersistedRequestsLength() === 0) {
            return response;
        }

        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`;
        discardedSearchHashes.add(hash);
        Log.info('[DiscardStaleSearchSnapshot] Dropping the snapshot of a search that writes were queued behind', false, {hash, pendingWrites: getPersistedRequestsLength()});
        return {...response, onyxData: response.onyxData.filter((update) => update.key !== snapshotKey)};
    });

export default discardStaleSearchSnapshot;
export {guardSearchAgainstStaleSnapshot, releaseStaleSnapshotGuard};
