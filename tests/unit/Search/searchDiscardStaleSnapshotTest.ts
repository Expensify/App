import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {guardSearchAgainstStaleSnapshot, releaseStaleSnapshotGuard} from '@libs/Middleware/DiscardStaleSearchSnapshot';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@libs/Middleware/DiscardStaleSearchSnapshot', () => ({
    guardSearchAgainstStaleSnapshot: jest.fn(),
    releaseStaleSnapshotGuard: jest.fn(() => false),
}));

const mockedMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);
const mockedWaitForWrites = jest.mocked(waitForWrites);
const mockedGuard = jest.mocked(guardSearchAgainstStaleSnapshot);
const mockedRelease = jest.mocked(releaseStaleSnapshotGuard);

function getQueryJSON() {
    const queryJSON = buildSearchQueryJSON('type:expense');
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }
    return queryJSON;
}

// The refetch that follows an edit can return results from before a second, quicker edit. Its snapshot is then dropped,
// and the search has to run again once that edit's write lands.
describe('search stale snapshot re-fire', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedWaitForWrites.mockResolvedValue(undefined);
        mockedMakeRequestWithSideEffects.mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
        mockedRelease.mockReturnValue(false);
    });

    it('runs the search again, without a loading state, when its snapshot was dropped', async () => {
        // Given a refetch whose snapshot gets dropped because a write was queued while it was in flight
        const queryJSON = getQueryJSON();
        mockedRelease.mockReturnValueOnce(true);

        // When it is sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true});

        // Then it guarded itself after waiting for writes, and ran again so the snapshot gets the server's values after that write
        expect(mockedGuard).toHaveBeenCalledWith(queryJSON.hash);
        expect(mockedWaitForWrites).toHaveBeenCalledTimes(2);
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
        const refireOptimisticData = mockedMakeRequestWithSideEffects.mock.calls.at(1)?.[2]?.optimisticData ?? [];
        expect(JSON.stringify(refireOptimisticData)).not.toContain('"isLoading":true');
    });

    it('runs only once when its snapshot was kept', async () => {
        // Given a refetch whose response is fresh
        const queryJSON = getQueryJSON();

        // When it is sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true});

        // Then it reaches the backend once
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);
    });

    it('does not guard a search that did not ask for it', async () => {
        // Given a regular search, like the one the page load fires
        const queryJSON = getQueryJSON();

        // When it is sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});

        // Then its response is never dropped, so the first results of a search always land
        expect(mockedGuard).not.toHaveBeenCalled();
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);
    });
});
