import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import discardStaleSearchSnapshot, {guardSearchAgainstStaleSnapshot, releaseStaleSnapshotGuard} from '@libs/Middleware/DiscardStaleSearchSnapshot';

import {getLength as getPersistedRequestsLength, getQueuedRequestsCount} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

jest.mock('@userActions/PersistedRequests', () => ({
    getLength: jest.fn(() => 0),
    getQueuedRequestsCount: jest.fn(() => 0),
}));

const HASH = 12345;
const JSON_QUERY = JSON.stringify({hash: HASH, offset: 0});
const NEXT_PAGE_JSON_QUERY = JSON.stringify({hash: HASH, offset: 50});
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${HASH}` as const;
const OTHER_KEY = `${ONYXKEYS.COLLECTION.REPORT}1` as const;

function buildRequest(command: string = READ_COMMANDS.SEARCH, jsonQuery = JSON_QUERY): Request<OnyxKey> {
    return {command, data: {hash: HASH, jsonQuery}};
}

function buildResponse(): Response<OnyxKey> {
    return {
        jsonCode: 200,
        onyxData: [
            {onyxMethod: Onyx.METHOD.MERGE, key: OTHER_KEY, value: {reportID: '1'}},
            {onyxMethod: Onyx.METHOD.MERGE, key: SNAPSHOT_KEY, value: {data: {}}},
        ],
    };
}

describe('DiscardStaleSearchSnapshot middleware', () => {
    afterEach(() => {
        releaseStaleSnapshotGuard(JSON_QUERY);
        releaseStaleSnapshotGuard(NEXT_PAGE_JSON_QUERY);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(0);
        jest.mocked(getQueuedRequestsCount).mockReturnValue(0);
    });

    it('drops the snapshot of a guarded search when a write queued while it was in flight already finished', async () => {
        // Given a guarded search, and a write queued while it was in flight that finished and left the queue before its response
        guardSearchAgainstStaleSnapshot(JSON_QUERY, 0);
        jest.mocked(getQueuedRequestsCount).mockReturnValue(1);

        // When its response comes back with the write queue empty
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then the snapshot is still dropped, because the server may have read its data before that write, and the search is
        // told to run again so it picks up the write
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY]);
        expect(releaseStaleSnapshotGuard(JSON_QUERY)).toBe(true);
    });

    it('keeps the snapshot of a guarded search when the only writes were queued before it was sent', async () => {
        // Given writes that were queued and finished before the search waited for the queue and was sent
        jest.mocked(getQueuedRequestsCount).mockReturnValue(3);
        guardSearchAgainstStaleSnapshot(JSON_QUERY, 3);

        // When its response comes back with no write queued since
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then the response already includes those writes, so it is applied untouched
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY, SNAPSHOT_KEY]);
        expect(releaseStaleSnapshotGuard(JSON_QUERY)).toBe(false);
    });

    it('counts writes from when a search was sent, even when it is guarded later', async () => {
        // Given a search sent when 1 request had been queued, then an edit's write queued and finished, and only then the
        // search guarded by a refetch that joined it
        jest.mocked(getQueuedRequestsCount).mockReturnValue(2);
        guardSearchAgainstStaleSnapshot(JSON_QUERY, 1);

        // When its response comes back with the write queue empty
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then the snapshot is dropped, because the search was sent before the edit and its response can't include it
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY]);
        expect(releaseStaleSnapshotGuard(JSON_QUERY)).toBe(true);
    });

    it('drops the snapshot of a guarded search when a write was queued while it was in flight', async () => {
        // Given a guarded search, and a write (e.g. a quick second inline edit) queued while it was in flight
        guardSearchAgainstStaleSnapshot(JSON_QUERY, 0);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);

        // When its response comes back
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then the stale snapshot is dropped so it can't overwrite the write's optimistic values, the other updates are kept,
        // and the search is told to run again
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY]);
        expect(releaseStaleSnapshotGuard(JSON_QUERY)).toBe(true);
    });

    it('keeps the snapshot of a guarded search when no write is pending', async () => {
        // Given a guarded search and an idle write queue
        guardSearchAgainstStaleSnapshot(JSON_QUERY, 0);

        // When its response comes back
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then the response is fresh, so it is applied untouched and the search doesn't run again
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY, SNAPSHOT_KEY]);
        expect(releaseStaleSnapshotGuard(JSON_QUERY)).toBe(false);
    });

    it('keeps the snapshot of a search that is not guarded, even when writes are pending', async () => {
        // Given a search that didn't ask for the guard (e.g. the page load search) and a pending write
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);

        // When its response comes back
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then it is applied untouched, so the first results of a search are never dropped
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY, SNAPSHOT_KEY]);
    });

    it('keeps the snapshot of another page of the same search while that search is guarded', async () => {
        // Given a guarded refetch of the first page, and a pending write
        guardSearchAgainstStaleSnapshot(JSON_QUERY, 0);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);

        // When the response of a "load more" page for the same hash comes back first
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(READ_COMMANDS.SEARCH, NEXT_PAGE_JSON_QUERY), false);

        // Then that page is applied, because nothing would run it again, and the guarded refetch isn't told its snapshot was dropped
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY, SNAPSHOT_KEY]);
        expect(releaseStaleSnapshotGuard(NEXT_PAGE_JSON_QUERY)).toBe(false);
        expect(releaseStaleSnapshotGuard(JSON_QUERY)).toBe(false);
    });

    it('keeps guarding a search after another guarded search for the same hash is released', async () => {
        // Given two guarded pages of the same search, and a pending write
        guardSearchAgainstStaleSnapshot(JSON_QUERY, 0);
        guardSearchAgainstStaleSnapshot(NEXT_PAGE_JSON_QUERY, 0);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);

        // When the first one finishes and is released before the other's response comes back
        releaseStaleSnapshotGuard(NEXT_PAGE_JSON_QUERY);
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then the other search is still guarded, so its stale snapshot is dropped
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY]);
        expect(releaseStaleSnapshotGuard(JSON_QUERY)).toBe(true);
    });

    it('ignores requests other than Search', async () => {
        // Given a guarded search and a pending write
        guardSearchAgainstStaleSnapshot(JSON_QUERY, 0);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);

        // When a response for another command that happens to carry the same data comes back
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT), false);

        // Then it is applied untouched
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY, SNAPSHOT_KEY]);
        expect(releaseStaleSnapshotGuard(JSON_QUERY)).toBe(false);
    });
});
