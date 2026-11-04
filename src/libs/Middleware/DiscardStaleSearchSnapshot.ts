/**
 * Protects optimistic inline edits from older Search responses. For guarded searches, a local inline-edit write queued
 * after dispatch can make the snapshot stale, even if that write has already finished. This middleware drops only the
 * matching snapshot update, preserving other response updates, and marks the search to rerun after waiting for writes.
 */
import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import {getLength as getPersistedRequestsLength, getQueuedInlineEditWritesCount} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';

import type Middleware from './types';

/**
 * Queries (the `jsonQuery` sent to the backend) of the in-flight searches whose snapshot is dropped if a local inline edit
 * was queued while they were in flight, each mapped to the edit count at dispatch. The query is keyed
 * rather than the hash because it holds the offset: several pages of one hash can be in flight at once, and only the
 * search that asked for the guard may have its snapshot dropped.
 */
const guardedSearchQueries = new Map<string, number>();

/** Queries of the guarded searches whose snapshot was dropped, so the search knows to run again once the writes land. */
const discardedSearchQueries = new Set<string>();

/**
 * Guards a search using the local inline-edit count at dispatch. A later edit can make its response stale even if
 * that edit finishes before the response arrives.
 */
function guardSearchAgainstStaleSnapshot(jsonQuery: string, queuedInlineEditWritesCountWhenSent: number) {
    guardedSearchQueries.set(jsonQuery, queuedInlineEditWritesCountWhenSent);
    discardedSearchQueries.delete(jsonQuery);
}

/** Stops guarding the search and returns whether its snapshot was dropped. */
function releaseStaleSnapshotGuard(jsonQuery: string): boolean {
    guardedSearchQueries.delete(jsonQuery);
    return discardedSearchQueries.delete(jsonQuery);
}

const discardStaleSearchSnapshot: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const hash = request?.data?.hash;
        const jsonQuery = request?.data?.jsonQuery;
        const queuedInlineEditWritesCountWhenSent = typeof jsonQuery === 'string' ? guardedSearchQueries.get(jsonQuery) : undefined;
        if (
            request?.command !== READ_COMMANDS.SEARCH ||
            typeof hash !== 'number' ||
            typeof jsonQuery !== 'string' ||
            queuedInlineEditWritesCountWhenSent === undefined ||
            !response?.onyxData
        ) {
            return response;
        }

        // Followers can send searches while the leader's writes remain pending. Only writes queued since this search
        // was sent make it stale; counting older pending writes would discard every response and keep running it again.
        const writesQueuedSinceSent = getQueuedInlineEditWritesCount() - queuedInlineEditWritesCountWhenSent;
        if (writesQueuedSinceSent <= 0) {
            return response;
        }

        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`;
        discardedSearchQueries.add(jsonQuery);
        Log.info('[DiscardStaleSearchSnapshot] Dropping the snapshot of a search that writes were queued behind', false, {
            hash,
            writesQueuedSinceSent,
            pendingWrites: getPersistedRequestsLength(),
        });
        return {...response, onyxData: response.onyxData.filter((update) => update.key !== snapshotKey)};
    });

export default discardStaleSearchSnapshot;
export {guardSearchAgainstStaleSnapshot, releaseStaleSnapshotGuard};
