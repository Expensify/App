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

function getLastRequestJsonQuery(): Record<string, unknown> {
    const requestParams = mockedMakeRequestWithSideEffects.mock.calls.at(-1)?.[1];
    if (!requestParams || !('jsonQuery' in requestParams) || typeof requestParams.jsonQuery !== 'string') {
        throw new Error('Search request params with jsonQuery should be defined');
    }
    return JSON.parse(requestParams.jsonQuery) as Record<string, unknown>;
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
});
