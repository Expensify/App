import {act, renderHook, waitFor} from '@testing-library/react-native';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {buildInsightsQueryString} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = '1';
const SPEND_SEARCH_KEY = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].searchKey;

/** Makes the user's default workspace, which is where the default group currency comes from. */
async function setUpActivePolicy(outputCurrency: string) {
    const policy: Policy = {...createRandomPolicy(Number(POLICY_ID), CONST.POLICY.TYPE.TEAM), outputCurrency};
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
    await waitForBatchedUpdates();
}

/** Reads back what the dashboard's selections were stored as. */
async function getStoredQuery(): Promise<string | undefined> {
    const searchFilters = await new Promise<Record<string, unknown> | undefined>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.SEARCH_FILTERS,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value as Record<string, unknown> | undefined);
            },
        });
    });

    const searchFilter = searchFilters?.[SPEND_SEARCH_KEY];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return typeof searchFilter === 'object' ? (searchFilter as {query: string}).query : undefined;
}

async function storeFilters(filters: InsightsFilters) {
    await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {[SPEND_SEARCH_KEY]: {query: buildInsightsQueryString(filters)}});
    await waitForBatchedUpdates();
}

describe('useInsightsFilters', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        // Pin the date, so the presets cover a known range
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        jest.setSystemTime(new Date(2026, 9, 8));
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('opens on the page defaults, in the default workspace currency', async () => {
        // Given a user whose default workspace reports in PLN, and no stored selections
        await setUpActivePolicy('PLN');

        // When the dashboard resolves its filters
        const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));
        await waitFor(() => expect(result.current.isResolved).toBe(true));

        // Then it reports on the year to date, across every workspace, in that currency
        expect(result.current.filters).toEqual({
            date: {preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE},
            policyIDs: [],
            groupBy: CONST.SEARCH.GROUP_BY.MONTH,
            groupCurrency: 'PLN',
        });
    });

    it('opens on the stored selections where the user has made one', async () => {
        // Given a dashboard last left on a single workspace, grouped by quarter, in USD
        await setUpActivePolicy('PLN');
        const stored: InsightsFilters = {
            date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS},
            policyIDs: ['A1'],
            groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
            groupCurrency: 'USD',
        };
        await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {[SPEND_SEARCH_KEY]: {query: buildInsightsQueryString(stored)}});
        await waitForBatchedUpdates();

        // When the dashboard resolves its filters
        const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));
        await waitFor(() => expect(result.current.isResolved).toBe(true));

        // Then what was stored wins over the page defaults and the default workspace currency
        expect(result.current.filters).toEqual(stored);
    });

    it('keeps reporting the page defaults once a selection is stored, so a control can reset to them', async () => {
        // Given a dashboard stored in USD for a user whose default workspace reports in PLN
        await setUpActivePolicy('PLN');
        await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {
            [SPEND_SEARCH_KEY]: {
                query: buildInsightsQueryString({date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH}, policyIDs: ['A1'], groupBy: CONST.SEARCH.GROUP_BY.QUARTER, groupCurrency: 'USD'}),
            },
        });
        await waitForBatchedUpdates();

        // When the dashboard resolves its filters
        const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));
        await waitFor(() => expect(result.current.isResolved).toBe(true));

        // Then the defaults ignore the stored selections, keeping the default workspace currency for Group currency's Reset
        expect(result.current.defaultFilters).toEqual({
            date: {preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE},
            policyIDs: [],
            groupBy: CONST.SEARCH.GROUP_BY.MONTH,
            groupCurrency: 'PLN',
        });
    });

    it('waits for the stored selections before saying it has resolved', async () => {
        // Given stored selections that are still being written
        Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {
            [SPEND_SEARCH_KEY]: {
                query: buildInsightsQueryString({date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: 'USD'}),
            },
        });

        // When the dashboard asks for its filters before that write lands
        const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));

        // Then it reports as unresolved, so the page doesn't request a dashboard the user never asked for
        expect(result.current.isResolved).toBe(false);

        // And it resolves once the selections are in
        await waitForBatchedUpdates();
        await waitFor(() => expect(result.current.isResolved).toBe(true));
    });

    it('stores a control’s selection alongside the rest of the dashboard’s filters', async () => {
        // Given a dashboard reporting on one workspace
        await setUpActivePolicy('PLN');
        await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {
            [SPEND_SEARCH_KEY]: {
                query: buildInsightsQueryString({date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS}, policyIDs: ['A1'], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: 'USD'}),
            },
        });
        await waitForBatchedUpdates();
        const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));
        await waitFor(() => expect(result.current.isResolved).toBe(true));

        // When only the time bucket is changed
        await act(async () => {
            result.current.setFilters({groupBy: CONST.SEARCH.GROUP_BY.QUARTER});
            await waitForBatchedUpdates();
        });

        // Then the stored query carries the new bucket and everything the other controls had already narrowed
        expect(await getStoredQuery()).toBe('groupBy:quarter groupCurrency:USD policyID:A1 date:last-12-months');
    });

    it('keeps the selected grouping saved when a new date range rules it out', async () => {
        // Given a dashboard over the last 12 months grouped by quarter
        await setUpActivePolicy('PLN');
        await storeFilters({date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.QUARTER, groupCurrency: 'USD'});
        const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));
        await waitFor(() => expect(result.current.isResolved).toBe(true));

        // When the date is changed to this month, which only offers Day and Week
        await act(async () => {
            result.current.setFilters({date: {preset: CONST.SEARCH.DATE_PRESETS.THIS_MONTH}});
            await waitForBatchedUpdates();
        });

        // Then quarter stays saved, so it comes back once a range that offers it is picked
        expect(await getStoredQuery()).toBe('groupBy:quarter groupCurrency:USD date:this-month');
        expect(result.current.filters.groupBy).toBe(CONST.SEARCH.GROUP_BY.QUARTER);
    });

    it('keeps the saved grouping on a single day, which only offers day', async () => {
        // Given a dashboard over the last 12 months grouped by quarter
        await setUpActivePolicy('PLN');
        await storeFilters({date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.QUARTER, groupCurrency: 'USD'});
        const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));
        await waitFor(() => expect(result.current.isResolved).toBe(true));

        // When the date is changed to a single day
        await act(async () => {
            result.current.setFilters({date: {on: '2026-03-04'}});
            await waitForBatchedUpdates();
        });

        // Then the grouping stays quarter, ready for when a range is picked again
        expect(result.current.filters.groupBy).toBe(CONST.SEARCH.GROUP_BY.QUARTER);
    });

    describe('saving to the server', () => {
        let writeSpy: jest.SpyInstance;

        beforeEach(() => {
            writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        it('saves a Compare mode change to the server, since it does not fetch the dashboard again', async () => {
            // Given a dashboard with no Compare mode picked
            await setUpActivePolicy('PLN');
            const stored: InsightsFilters = {date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: 'USD'};
            await storeFilters(stored);
            const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));
            await waitFor(() => expect(result.current.isResolved).toBe(true));

            // When the user compares against the previous period
            await act(async () => {
                result.current.setFilters({compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD});
                await waitForBatchedUpdates();
            });

            // Then the full query is saved under the dashboard's search key, so the choice survives signing out
            const inputQuery = buildInsightsQueryString({...stored, compare: CONST.SEARCH.COMPARE.PREVIOUS_PERIOD});
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SAVE_SEARCH_FILTERS, {jsonQuery: JSON.stringify({searchKey: SPEND_SEARCH_KEY, inputQuery})}, expect.anything());
        });

        it('does not save other filter changes to the server, since GetInsights saves them', async () => {
            // Given a dashboard grouped by month
            await setUpActivePolicy('PLN');
            await storeFilters({date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: 'USD'});
            const {result} = renderHook(() => useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND));
            await waitFor(() => expect(result.current.isResolved).toBe(true));

            // When the user groups by quarter
            await act(async () => {
                result.current.setFilters({groupBy: CONST.SEARCH.GROUP_BY.QUARTER});
                await waitForBatchedUpdates();
            });

            // Then no separate save is sent, and the selection is only stored locally
            expect(writeSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.SAVE_SEARCH_FILTERS, expect.anything(), expect.anything());
            expect(await getStoredQuery()).toBe('groupBy:quarter groupCurrency:USD date:last-12-months');
        });
    });
});
