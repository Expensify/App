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

type SentQuery = {
    groupBy?: string;
    inputQuery?: string;
    rawFilterList?: Array<{key: string}>;
    filters?: unknown;
};

function getQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }
    return queryJSON;
}

function getLastSentQuery(): SentQuery {
    const requestParams = mockedMakeRequestWithSideEffects.mock.calls.at(-1)?.[1];
    if (!requestParams || !('jsonQuery' in requestParams) || typeof requestParams.jsonQuery !== 'string') {
        throw new Error('Search request params with jsonQuery should be defined');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the request body is the query search() serialized
    return JSON.parse(requestParams.jsonQuery) as SentQuery;
}

describe('search with an Insights-only group-by', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedWaitForWrites.mockResolvedValue(undefined);
        mockedMakeRequestWithSideEffects.mockResolvedValue(undefined);
    });

    it.each([CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE, CONST.SEARCH.GROUP_BY.VIOLATION, CONST.SEARCH.GROUP_BY.PAID_BY])('sends a Spend query grouped by %s ungrouped', async (groupBy) => {
        // Given a Spend query with a group-by only Insights charts use typed in, which the Search command rejects
        const queryJSON = getQueryJSON(`type:expense group-by:${groupBy} merchant:taxi`);

        // When the search is fired
        await search({queryJSON, searchKey: undefined, offset: 0, isLoading: false});

        // Then the request leaves the group-by out everywhere the backend reads it, and keeps the rest of the query
        const sentQuery = getLastSentQuery();
        expect(sentQuery.groupBy).toBeUndefined();
        expect(sentQuery.inputQuery).not.toMatch(/group-?by:/i);
        expect((sentQuery.rawFilterList ?? []).map((filter) => filter.key)).not.toContain(CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY);
        expect(sentQuery.inputQuery).toContain('taxi');
        expect(sentQuery.filters).toBeTruthy();
    });

    it('still sends a group-by the Search command supports', async () => {
        // Given a Spend query grouped by submitter
        const queryJSON = getQueryJSON(`type:expense group-by:${CONST.SEARCH.GROUP_BY.FROM}`);

        // When the search is fired
        await search({queryJSON, searchKey: undefined, offset: 0, isLoading: false});

        // Then the group-by is sent as typed
        const sentQuery = getLastSentQuery();
        expect(sentQuery.groupBy).toBe(CONST.SEARCH.GROUP_BY.FROM);
        expect(sentQuery.inputQuery).toMatch(new RegExp(`group-?by:${CONST.SEARCH.GROUP_BY.FROM}`, 'i'));
    });
});
