import buildInsightsDetailsQuery from '@pages/Insights/details/buildInsightsDetailsQuery';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';

const FILTERS: InsightsFilters = {date: {from: '2026-01-01', to: '2026-03-20'}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: CONST.CURRENCY.USD};
const TOP_EXPENSES_SNAPSHOT_HASH = 123;
const LAST_DAY = '2026-11-19';
const TIME_SECTIONS = [CONST.INSIGHTS.DETAILS_SECTION.SUMMARY, CONST.INSIGHTS.DETAILS_SECTION.TOP_EXPENSES];
const RANKING_SECTIONS = [CONST.INSIGHTS.DETAILS_SECTION.SUMMARY, CONST.INSIGHTS.DETAILS_SECTION.RECENT_HISTORY, CONST.INSIGHTS.DETAILS_SECTION.TOP_EXPENSES];

describe('buildInsightsDetailsQuery', () => {
    it('summarizes the last period in the Date range on ranking graphs, up to the range end', () => {
        // Given a custom range grouped by month that ends partway through March
        // When a member on Top spenders opens the Details panel
        const query = buildInsightsDetailsQuery({
            graphKey: CONST.INSIGHTS.GRAPH.TOP_SPENDERS,
            sections: RANKING_SECTIONS,
            filters: FILTERS,
            itemGroupBy: CONST.SEARCH.GROUP_BY.FROM,
            itemKey: '1234',
            periodEnd: undefined,
            topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
            lastDay: LAST_DAY,
        });

        // Then March is summarized up to the range end as a finished period, and the member is sent as an account ID
        expect(query?.period).toEqual({start: '2026-03-01', end: '2026-03-20'});
        expect(query?.periodGroupBy).toBe(CONST.SEARCH.GROUP_BY.MONTH);
        expect(query?.isPeriodInProgress).toBe(false);
        const request: unknown = JSON.parse(query?.jsonQuery ?? '{}');
        expect(request).toMatchObject({item: {groupBy: CONST.SEARCH.GROUP_BY.FROM, value: 1234}, hash: query?.hash, topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH});
    });

    it('summarizes the clicked period on Spend over time, without an item', () => {
        // Given a February point clicked on Spend over time
        // When the Details panel opens
        const query = buildInsightsDetailsQuery({
            graphKey: CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME,
            sections: TIME_SECTIONS,
            filters: FILTERS,
            itemGroupBy: undefined,
            itemKey: '2026-02-01',
            periodEnd: '2026-02-28',
            topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
            lastDay: LAST_DAY,
        });

        // Then February is summarized and the request names no item, since the period is the item
        expect(query?.period).toEqual({start: '2026-02-01', end: '2026-02-28'});
        const request: unknown = JSON.parse(query?.jsonQuery ?? '{}');
        expect(request).not.toHaveProperty('item');
    });

    it('sends the Biggest changes grouping outside the hash, so a refetch for another grouping merges into the same panel', () => {
        // Given a February point on Spend over time, whose panel lists Biggest changes
        const params = {
            graphKey: CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME,
            filters: FILTERS,
            itemGroupBy: undefined,
            itemKey: '2026-02-01',
            periodEnd: '2026-02-28',
            topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
            lastDay: LAST_DAY,
        };

        // When the panel opens by categories, then the user switches Biggest changes to merchants
        const panelQuery = buildInsightsDetailsQuery({
            ...params,
            sections: [...TIME_SECTIONS, CONST.INSIGHTS.DETAILS_SECTION.BIGGEST_CHANGES],
            biggestChangesGroupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        });
        const merchantsQuery = buildInsightsDetailsQuery({...params, sections: [CONST.INSIGHTS.DETAILS_SECTION.BIGGEST_CHANGES], biggestChangesGroupBy: CONST.SEARCH.GROUP_BY.MERCHANT});

        // Then both requests share the panel's hash, and each asks for its own grouping
        expect(merchantsQuery?.hash).toBe(panelQuery?.hash);
        expect(JSON.parse(panelQuery?.jsonQuery ?? '{}')).toMatchObject({biggestChangesGroupBy: CONST.SEARCH.GROUP_BY.CATEGORY});
        expect(JSON.parse(merchantsQuery?.jsonQuery ?? '{}')).toMatchObject({
            sections: [CONST.INSIGHTS.DETAILS_SECTION.BIGGEST_CHANGES],
            biggestChangesGroupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        });
    });

    it('leaves the Biggest changes grouping out of requests without the section', () => {
        // Given a ranking graph, whose panel has no Biggest changes
        // When its request is built with a saved grouping
        const query = buildInsightsDetailsQuery({
            graphKey: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
            sections: RANKING_SECTIONS,
            biggestChangesGroupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            filters: FILTERS,
            itemGroupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            itemKey: 'Uber',
            periodEnd: undefined,
            topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
            lastDay: LAST_DAY,
        });

        // Then the grouping isn't sent, so the backend doesn't save a choice the panel didn't show
        expect(JSON.parse(query?.jsonQuery ?? '{}')).not.toHaveProperty('biggestChangesGroupBy');
    });

    it('requests nothing for a graph GetInsightsDetails does not support', () => {
        // Given a Top tags point, whose chart declares no Details sections
        // When the Details panel opens
        const query = buildInsightsDetailsQuery({
            graphKey: CONST.INSIGHTS.GRAPH.TOP_TAGS,
            sections: undefined,
            filters: FILTERS,
            itemGroupBy: CONST.SEARCH.GROUP_BY.TAG,
            itemKey: 'Marketing',
            periodEnd: undefined,
            topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
            lastDay: LAST_DAY,
        });

        // Then there is no request, so the panel loads Top expenses through Search instead of getting rejected
        expect(query).toBeUndefined();
    });

    it('summarizes the period with the last counted day when the Date range ends in the future', () => {
        // Given This year grouped by month, a range that runs to December 31 while expenses are counted through November 19
        jest.useFakeTimers().setSystemTime(new Date('2026-11-19T12:00:00'));

        // When a merchant on Top merchants opens the Details panel
        const query = buildInsightsDetailsQuery({
            graphKey: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
            sections: RANKING_SECTIONS,
            filters: {...FILTERS, date: {preset: CONST.SEARCH.DATE_PRESETS.THIS_YEAR}},
            itemGroupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            itemKey: 'Starbucks',
            periodEnd: undefined,
            topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
            lastDay: LAST_DAY,
        });

        // Then November is summarized up to that day as an in-progress period, since the chart has no December bucket yet
        expect(query?.period).toEqual({start: '2026-11-01', end: LAST_DAY});
        expect(query?.isPeriodInProgress).toBe(true);
        jest.useRealTimers();
    });
});
