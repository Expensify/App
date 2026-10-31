import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

const mockedMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);
const mockedWaitForWrites = jest.mocked(waitForWrites);

function getQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }
    return queryJSON;
}

function getLastRequestJsonQuery(): unknown {
    const requestParams = mockedMakeRequestWithSideEffects.mock.calls.at(-1)?.[1];
    if (!requestParams || !('jsonQuery' in requestParams) || typeof requestParams.jsonQuery !== 'string') {
        throw new Error('Search request params with jsonQuery should be defined');
    }
    const parsedJsonQuery: unknown = JSON.parse(requestParams.jsonQuery);
    return parsedJsonQuery;
}

/** Holds the next request open until the test resolves it. */
function holdNextRequest() {
    let resolveRequest: () => void = () => {};
    const requestPromise = new Promise<{jsonCode: number}>((resolve) => {
        resolveRequest = () => resolve({jsonCode: CONST.JSON_CODE.SUCCESS});
    });
    mockedMakeRequestWithSideEffects.mockImplementationOnce(() => requestPromise);
    return resolveRequest;
}

// The backend only returns one row per trip room when a trip search sends shouldReturnTripRooms, and keeps
// type:trip an expense search otherwise, so these tests pin down when the flag is sent.
describe('search shouldReturnTripRooms flag', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedWaitForWrites.mockResolvedValue(undefined);
        mockedMakeRequestWithSideEffects.mockResolvedValue(undefined);
    });

    it('sends the flag for a trip search with the TravelApproval beta', async () => {
        // Given a trip search from a user with the TravelApproval beta
        // When the search is fired
        await search({queryJSON: getQueryJSON('type:trip'), searchKey: CONST.SEARCH.SEARCH_KEYS.TRIPS, offset: 0, isLoading: false, shouldReturnTripRooms: true});

        // Then the backend is asked for trip rooms
        expect(getLastRequestJsonQuery()).toEqual(expect.objectContaining({type: CONST.SEARCH.DATA_TYPES.TRIP, shouldReturnTripRooms: true}));
    });

    it('leaves the flag out for a trip search without the beta', async () => {
        // Given a trip search from a user without the TravelApproval beta, which stays an expense search
        // When the search is fired
        await search({queryJSON: getQueryJSON('type:trip merchant:hotel'), searchKey: undefined, offset: 0, isLoading: false});

        // Then the flag isn't sent
        expect(getLastRequestJsonQuery()).not.toHaveProperty('shouldReturnTripRooms');
    });

    it('leaves the flag out for other search types even with the beta', async () => {
        // Given an expense search from a user with the TravelApproval beta, since the flag only means something for trips
        // When the search is fired
        await search({queryJSON: getQueryJSON('type:expense merchant:taxi'), searchKey: undefined, offset: 0, isLoading: false, shouldReturnTripRooms: true});

        // Then the flag isn't sent
        expect(getLastRequestJsonQuery()).not.toHaveProperty('shouldReturnTripRooms');
    });
    it('re-fires a trip rooms search that collides with an in-flight travel expense search', async () => {
        // Given a trip search without the flag still waiting for its response, e.g. fired before the beta loaded
        const queryJSON = getQueryJSON('type:trip');
        const resolveExpenseRequest = holdNextRequest();
        const expenseSearch = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.TRIPS, offset: 0, isLoading: false});

        // When the same trip search is fired for trip rooms, which shares the hash and the offset
        search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.TRIPS, offset: 0, isLoading: false, shouldReturnTripRooms: true});

        // Then it waits behind the in-flight request instead of being dropped
        await Promise.resolve();
        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(1);

        // When the travel expense request finishes
        resolveExpenseRequest();
        await expenseSearch;

        // Then trip rooms are asked for afterward, so they are what lands on the snapshot
        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(2);
        expect(getLastRequestJsonQuery()).toEqual(expect.objectContaining({shouldReturnTripRooms: true}));
    });
});
