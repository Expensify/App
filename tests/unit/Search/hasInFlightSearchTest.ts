import {hasInFlightSearch, search} from '@libs/actions/Search';
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

function getQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }

    return queryJSON;
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

describe('hasInFlightSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(waitForWrites).mockResolvedValue(undefined);
        mockedMakeRequestWithSideEffects.mockResolvedValue(undefined);
    });

    it('is true while any page of the query is loading, and false once it lands', async () => {
        // Given a group's "show more" page waiting for its response
        const queryJSON = getQueryJSON('type:expense category:Food');
        const otherQueryJSON = getQueryJSON('type:expense category:Travel');
        const resolveRequest = holdNextRequest();
        const showMoreSearch = search({queryJSON, searchKey: undefined, offset: 50, shouldCalculateTotals: false, isLoading: false});
        await Promise.resolve();

        // Then that query counts as loading even though it isn't on its first page, and another query doesn't
        expect(hasInFlightSearch(queryJSON.hash)).toBe(true);
        expect(hasInFlightSearch(otherQueryJSON.hash)).toBe(false);

        // When the response lands
        resolveRequest();
        await showMoreSearch;

        // Then the query is no longer loading
        expect(hasInFlightSearch(queryJSON.hash)).toBe(false);
    });
});
