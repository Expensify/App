import {hasInFlightSearch, search, waitForInFlightSearch} from '@libs/actions/Search';
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

    it('waits for every loading page of the query, and resolves at once when none is loading', async () => {
        // Given a group loading its first page and its "show more" page at the same time
        const queryJSON = getQueryJSON('type:expense category:Food');
        const resolveFirstPage = holdNextRequest();
        const resolveShowMore = holdNextRequest();
        search({queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
        search({queryJSON, searchKey: undefined, offset: 50, shouldCalculateTotals: false, isLoading: false});
        await Promise.resolve();

        // When something waits for the query's running searches
        const onFinished = jest.fn();
        const waiting = waitForInFlightSearch(queryJSON.hash).then(onFinished);

        // Then it is still waiting after only the first page lands
        resolveFirstPage();
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 0);
        });
        expect(onFinished).not.toHaveBeenCalled();

        // And it finishes once the "show more" page lands too, with nothing left loading
        resolveShowMore();
        await waiting;
        expect(onFinished).toHaveBeenCalled();
        expect(hasInFlightSearch(queryJSON.hash)).toBe(false);

        // And a query with nothing loading doesn't wait at all
        await expect(waitForInFlightSearch(getQueryJSON('type:expense category:Travel').hash)).resolves.toBeUndefined();
    });
});
