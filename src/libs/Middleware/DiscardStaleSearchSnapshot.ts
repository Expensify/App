/**
 * Keeps optimistic inline edits on screen by dropping snapshots explicitly invalidated before an edit.
 * Other response updates still apply, and Search fetches the dropped snapshot again after writes finish.
 */
import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';

import type Middleware from './types';

// The serialized query includes the offset, so releasing one page does not remove another page's invalidation.
const staleSearchQueries = new Set<string>();
const droppedSearchQueries = new Set<string>();

/** Marks a sent Search as stale before an inline edit changes the snapshot. */
function markSearchSnapshotStale(jsonQuery: string) {
    staleSearchQueries.add(jsonQuery);
}

/** Cleans up on success, failure or cancellation and returns whether the snapshot was dropped. */
function releaseSearchSnapshot(jsonQuery: string): boolean {
    staleSearchQueries.delete(jsonQuery);
    return droppedSearchQueries.delete(jsonQuery);
}

const discardStaleSearchSnapshot: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const hash = request?.data?.hash;
        const jsonQuery = request?.data?.jsonQuery;
        if (request?.command !== READ_COMMANDS.SEARCH || typeof hash !== 'number' || typeof jsonQuery !== 'string' || !staleSearchQueries.has(jsonQuery) || !response?.onyxData) {
            return response;
        }

        staleSearchQueries.delete(jsonQuery);
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`;
        droppedSearchQueries.add(jsonQuery);
        Log.info('[DiscardStaleSearchSnapshot] Dropping a Search snapshot invalidated by an inline edit', false, {hash});
        return {...response, onyxData: response.onyxData.filter((update) => update.key !== snapshotKey)};
    });

export default discardStaleSearchSnapshot;
export {markSearchSnapshotStale, releaseSearchSnapshot};
