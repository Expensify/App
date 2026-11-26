import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import discardStaleSearchSnapshot, {markSearchSnapshotStale, releaseSearchSnapshot} from '@libs/Middleware/DiscardStaleSearchSnapshot';

import ONYXKEYS from '@src/ONYXKEYS';

const HASH = 12345;
const JSON_QUERY = JSON.stringify({hash: HASH, offset: 0});
const NEXT_PAGE_JSON_QUERY = JSON.stringify({hash: HASH, offset: 50});
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${HASH}` as const;
const OTHER_KEY = `${ONYXKEYS.COLLECTION.REPORT}1` as const;

function buildResponse() {
    return {
        jsonCode: 200,
        onyxData: [
            {onyxMethod: 'merge' as const, key: OTHER_KEY, value: {reportID: '1'}},
            {onyxMethod: 'merge' as const, key: SNAPSHOT_KEY, value: {data: {}}},
        ],
    };
}

describe('explicitly invalidated Search snapshots', () => {
    afterEach(() => {
        releaseSearchSnapshot(JSON_QUERY);
        releaseSearchSnapshot(NEXT_PAGE_JSON_QUERY);
    });

    it('drops only the invalidated snapshot without mutating the response', async () => {
        // Given an old response explicitly invalidated before an inline edit
        const original = buildResponse();
        markSearchSnapshotStale(JSON_QUERY);

        // When its response arrives
        const response = await discardStaleSearchSnapshot(Promise.resolve(original), {command: READ_COMMANDS.SEARCH, data: {hash: HASH, jsonQuery: JSON_QUERY}}, false);

        // Then other collections and metadata survive, and the caller is told once to refetch
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY]);
        expect(original.onyxData).toHaveLength(2);
        expect(response?.jsonCode).toBe(200);
        expect(releaseSearchSnapshot(JSON_QUERY)).toBe(true);
        expect(releaseSearchSnapshot(JSON_QUERY)).toBe(false);
    });

    it.each([READ_COMMANDS.SEARCH, WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT])('keeps responses without an applicable invalidation (%s)', async (command) => {
        // Given a fresh Search or a non-Search response sharing an invalidated query
        if (command !== READ_COMMANDS.SEARCH) {
            markSearchSnapshotStale(JSON_QUERY);
        }
        const original = buildResponse();

        // When it passes through the middleware
        const response = await discardStaleSearchSnapshot(Promise.resolve(original), {command, data: {hash: HASH, jsonQuery: JSON_QUERY}}, false);

        // Then it is returned untouched
        expect(response).toBe(original);
        expect(releaseSearchSnapshot(JSON_QUERY)).toBe(false);
    });

    it('keeps invalidation independent for different offsets of the same hash', async () => {
        // Given two invalidated pages of the same search
        markSearchSnapshotStale(JSON_QUERY);
        markSearchSnapshotStale(NEXT_PAGE_JSON_QUERY);

        // When the second page is released first
        releaseSearchSnapshot(NEXT_PAGE_JSON_QUERY);
        const response = await discardStaleSearchSnapshot(Promise.resolve(buildResponse()), {command: READ_COMMANDS.SEARCH, data: {hash: HASH, jsonQuery: JSON_QUERY}}, false);

        // Then the first page remains invalidated
        expect(response?.onyxData?.map((update) => update.key)).toEqual([OTHER_KEY]);
        expect(releaseSearchSnapshot(JSON_QUERY)).toBe(true);
    });

    it('clears an invalidation when a request is cancelled before receiving a response', async () => {
        // Given an invalidated request
        markSearchSnapshotStale(JSON_QUERY);

        // When cancellation releases it and another request reuses its query
        expect(releaseSearchSnapshot(JSON_QUERY)).toBe(false);
        const original = buildResponse();
        const response = await discardStaleSearchSnapshot(Promise.resolve(original), {command: READ_COMMANDS.SEARCH, data: {hash: HASH, jsonQuery: JSON_QUERY}}, false);

        // Then the new response is not dropped
        expect(response).toBe(original);
    });
});
