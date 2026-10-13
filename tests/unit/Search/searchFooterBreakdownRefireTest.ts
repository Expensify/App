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

function getLastRequestJsonQuery(): string {
    const requestParams = mockedMakeRequestWithSideEffects.mock.calls.at(-1)?.[1];
    if (!requestParams || !('jsonQuery' in requestParams) || typeof requestParams.jsonQuery !== 'string') {
        throw new Error('Search request params with jsonQuery should be defined');
    }

    return requestParams.jsonQuery;
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

// The footer breakdown is not part of the search hash, so the hash+offset dedupe has to tell breakdowns apart itself.
describe('search footer breakdown re-fire', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedWaitForWrites.mockResolvedValue(undefined);
        mockedMakeRequestWithSideEffects.mockResolvedValue(undefined);
    });

    it('re-fires another breakdown that collides with an in-flight totals request', async () => {
        // Given a billable totals request still waiting for its response
        const billableQueryJSON = getQueryJSON(`type:expense ${CONST.SEARCH.SYNTAX_FILTER_KEYS.FOOTER_TOTAL}:${CONST.SEARCH.FOOTER_TOTAL.BILLABLE}`);
        const nonBillableQueryJSON = getQueryJSON(`type:expense ${CONST.SEARCH.SYNTAX_FILTER_KEYS.FOOTER_TOTAL}:${CONST.SEARCH.FOOTER_TOTAL.NON_BILLABLE}`);
        expect(nonBillableQueryJSON.hash).toBe(billableQueryJSON.hash);
        const resolveBillableRequest = holdNextRequest();
        search({queryJSON: billableQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, shouldCalculateTotals: true, isLoading: false, shouldShowLoading: false});

        // When the user switches to non-billable before it lands, which shares the hash and the offset
        let didNonBillableSettle = false;
        const nonBillableSearch = Promise.resolve(
            search({queryJSON: nonBillableQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, shouldCalculateTotals: true, isLoading: false, shouldShowLoading: false}),
        ).then(() => {
            didNonBillableSettle = true;
        });

        // Then it waits behind the in-flight request instead of being dropped, so the footer keeps its skeleton
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(1);
        expect(didNonBillableSettle).toBe(false);

        // When the billable request finishes
        resolveBillableRequest();
        await nonBillableSearch;

        // Then the non-billable breakdown is asked for afterward, so the latest one is what lands on the snapshot
        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(2);
        expect(getLastRequestJsonQuery()).toContain(CONST.SEARCH.FOOTER_TOTAL.NON_BILLABLE);
    });

    it('stamps the snapshot with the breakdown its total answers once the response lands', async () => {
        // Given a non-billable totals request
        const queryJSON = getQueryJSON(`type:expense ${CONST.SEARCH.SYNTAX_FILTER_KEYS.FOOTER_TOTAL}:${CONST.SEARCH.FOOTER_TOTAL.NON_BILLABLE}`);

        // When it is sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // Then its success stamps non-billable on the snapshot, after the response that may replace `snapshot.search`
        expect(mockedMakeRequestWithSideEffects.mock.calls.at(-1)?.[2]?.successData).toEqual([
            expect.objectContaining({value: {search: {footerTotal: CONST.SEARCH.FOOTER_TOTAL.NON_BILLABLE}}}),
        ]);
    });

    it('leaves the stamp alone for a later page without totals, which keeps the earlier total', async () => {
        // Given a later page of a non-billable search, asked for without totals
        const queryJSON = getQueryJSON(`type:expense ${CONST.SEARCH.SYNTAX_FILTER_KEYS.FOOTER_TOTAL}:${CONST.SEARCH.FOOTER_TOTAL.NON_BILLABLE}`);

        // When it is sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 50, shouldCalculateTotals: false, isLoading: false});

        // Then nothing is stamped, since the total on the snapshot is not one this request answered
        expect(mockedMakeRequestWithSideEffects.mock.calls.at(-1)?.[2]?.successData).toEqual([]);
    });

    it('still drops the same breakdown colliding with an in-flight totals request', async () => {
        // Given a billable totals request still waiting for its response
        const queryJSON = getQueryJSON(`type:expense ${CONST.SEARCH.SYNTAX_FILTER_KEYS.FOOTER_TOTAL}:${CONST.SEARCH.FOOTER_TOTAL.BILLABLE}`);
        const resolveRequest = holdNextRequest();
        const firstSearch = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, shouldCalculateTotals: true, isLoading: false});

        // When the same breakdown is asked for again, like the Search component refetching it
        const secondSearch = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, shouldCalculateTotals: true, isLoading: false});
        resolveRequest();
        await firstSearch;
        await Promise.resolve();

        // Then only one request reaches the backend, because the in-flight one already answers it
        expect(secondSearch).toBeUndefined();
        expect(mockedMakeRequestWithSideEffects.mock.calls).toHaveLength(1);
    });
});
