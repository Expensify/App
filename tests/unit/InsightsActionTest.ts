import {getInsights} from '@libs/actions/Insights';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import type {InsightsQuery} from '@pages/Insights/insightsQueries';
import buildInsightsJsonQuery from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    read: jest.fn(),
    write: jest.fn(),
}));

jest.mock('@libs/Log');

const mockedMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);
const mockedWaitForWrites = jest.mocked(waitForWrites);

const FILTERS: InsightsFilters = {
    date: {preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE},
    policyIDs: [],
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    groupCurrency: 'USD',
};

function buildRequest(filters: InsightsFilters): InsightsQuery {
    const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.SPEND, filters);
    if (!request) {
        throw new Error('Insights request should be defined for test setup');
    }

    return request;
}

function fetchInsights(request: InsightsQuery) {
    getInsights(CONST.INSIGHTS.DASHBOARD.SPEND, request.hash, request.jsonQuery);
}

describe('getInsights', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockedWaitForWrites.mockResolvedValue(undefined);
        mockedMakeRequestWithSideEffects.mockResolvedValue(undefined);
    });

    it('drops a repeat of the filters it is already fetching', async () => {
        // Given the dashboard's filters
        const request = buildRequest(FILTERS);

        // When the page asks for them twice before the first request comes back
        fetchInsights(request);
        fetchInsights(request);
        await waitForBatchedUpdates();

        // Then only the first one reaches the backend
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);
    });

    it('fetches another set of filters while one is still out', async () => {
        // Given the same dashboard grouped by month and by quarter
        const monthly = buildRequest(FILTERS);
        const quarterly = buildRequest({...FILTERS, groupBy: CONST.SEARCH.GROUP_BY.QUARTER});

        // When both are asked for before either comes back
        fetchInsights(monthly);
        fetchInsights(quarterly);
        await waitForBatchedUpdates();

        // Then both reach the backend
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
    });

    it('fetches the filters again once the request for them has come back', async () => {
        // Given filters that have already been fetched
        const request = buildRequest(FILTERS);
        fetchInsights(request);
        await waitForBatchedUpdates();

        // When the page asks for them again, as it does on every tab switch back
        fetchInsights(request);
        await waitForBatchedUpdates();

        // Then the second ask reaches the backend
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
    });

    it('fetches the filters again after a request for them failed', async () => {
        // Given a request that fails before it reaches the backend, as it does when the connection drops
        mockedMakeRequestWithSideEffects.mockRejectedValueOnce(new Error(CONST.ERROR.FAILED_TO_FETCH));
        const request = buildRequest(FILTERS);
        fetchInsights(request);
        await waitForBatchedUpdates();

        // When the page asks for the same filters again
        fetchInsights(request);
        await waitForBatchedUpdates();

        // Then the failure left the dashboard able to retry
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
    });
});
