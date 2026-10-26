import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import discardStaleSearchSnapshot, {guardSearchAgainstStaleSnapshot, releaseStaleSnapshotGuard} from '@libs/Middleware/DiscardStaleSearchSnapshot';

import {getLength as getPersistedRequestsLength} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

jest.mock('@userActions/PersistedRequests', () => ({
    getLength: jest.fn(() => 0),
}));

const HASH = 12345;
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${HASH}` as const;
const OTHER_KEY = `${ONYXKEYS.COLLECTION.REPORT}1` as const;

function buildRequest(command: string = READ_COMMANDS.SEARCH): Request<OnyxKey> {
    return {command, data: {hash: HASH, jsonQuery: '{}'}};
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
        releaseStaleSnapshotGuard(HASH);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(0);
    });

    it('drops the snapshot of a guarded search when a write was queued while it was in flight', async () => {
        // Given a guarded search, and a write (e.g. a quick second inline edit) queued while it was in flight
        guardSearchAgainstStaleSnapshot(HASH);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);

        // When its response comes back
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then the stale snapshot is dropped so it can't overwrite the write's optimistic values, the other updates are kept,
        // and the search is told to run again
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY]);
        expect(releaseStaleSnapshotGuard(HASH)).toBe(true);
    });

    it('keeps the snapshot of a guarded search when no write is pending', async () => {
        // Given a guarded search and an idle write queue
        guardSearchAgainstStaleSnapshot(HASH);

        // When its response comes back
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then the response is fresh, so it is applied untouched and the search doesn't run again
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY, SNAPSHOT_KEY]);
        expect(releaseStaleSnapshotGuard(HASH)).toBe(false);
    });

    it('keeps the snapshot of a search that is not guarded, even when writes are pending', async () => {
        // Given a search that didn't ask for the guard (e.g. the page load search) and a pending write
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);

        // When its response comes back
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(), false);

        // Then it is applied untouched, so the first results of a search are never dropped
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY, SNAPSHOT_KEY]);
    });

    it('ignores requests other than Search', async () => {
        // Given a guarded hash and a pending write
        guardSearchAgainstStaleSnapshot(HASH);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);

        // When a response for another command that happens to carry the same hash comes back
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), buildRequest(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT), false);

        // Then it is applied untouched
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY, SNAPSHOT_KEY]);
        expect(releaseStaleSnapshotGuard(HASH)).toBe(false);
    });
});
