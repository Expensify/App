import {search} from '@libs/actions/Search';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import refreshSearchAfterReportAction from '@libs/SearchRefreshUtils';

import CONST from '@src/CONST';

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
}));

const mockedSearch = jest.mocked(search);

function getQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }
    return queryJSON;
}

describe('refreshSearchAfterReportAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps asking for trip rooms when the search underneath is Trips', () => {
        // Given an action on a report while the Trips search, with the TravelApproval beta, is the search underneath
        const queryJSON = getQueryJSON('type:trip');

        // When the search is refreshed after the action
        refreshSearchAfterReportAction({
            currentSearchQueryJSON: queryJSON,
            currentSearchKey: CONST.SEARCH.SEARCH_KEYS.TRIPS,
            shouldCalculateTotals: false,
            isOffline: false,
            isLoading: false,
            shouldReturnTripRooms: true,
        });

        // Then the refresh still asks for trip rooms, so it doesn't overwrite them with travel expenses
        expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON, shouldReturnTripRooms: true}));
    });

    it('skips the refresh while offline', () => {
        // Given an action on a report while offline
        // When the search would be refreshed
        refreshSearchAfterReportAction({
            currentSearchQueryJSON: getQueryJSON('type:trip'),
            currentSearchKey: CONST.SEARCH.SEARCH_KEYS.TRIPS,
            shouldCalculateTotals: false,
            isOffline: true,
            isLoading: false,
            shouldReturnTripRooms: true,
        });

        // Then nothing is sent, since the request would only queue a stale refresh
        expect(mockedSearch).not.toHaveBeenCalled();
    });
});
