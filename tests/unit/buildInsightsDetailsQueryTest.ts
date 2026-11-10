import buildInsightsDetailsQuery from '@pages/Insights/details/buildInsightsDetailsQuery';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';

const FILTERS: InsightsFilters = {date: {from: '2026-01-01', to: '2026-03-20'}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: CONST.CURRENCY.USD};
const TOP_EXPENSES_SNAPSHOT_HASH = 123;

describe('buildInsightsDetailsQuery', () => {
    it('summarizes the last period in the Date range on ranking graphs, up to the range end', () => {
        // Given a custom range grouped by month that ends partway through March
        // When a member on Top spenders opens the Details panel
        const query = buildInsightsDetailsQuery({
            graphKey: CONST.INSIGHTS.GRAPH.TOP_SPENDERS,
            filters: FILTERS,
            itemGroupBy: CONST.SEARCH.GROUP_BY.FROM,
            itemKey: '1234',
            periodEnd: undefined,
            topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
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
            filters: FILTERS,
            itemGroupBy: undefined,
            itemKey: '2026-02-01',
            periodEnd: '2026-02-28',
            topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
        });

        // Then February is summarized and the request names no item, since the period is the item
        expect(query?.period).toEqual({start: '2026-02-01', end: '2026-02-28'});
        const request: unknown = JSON.parse(query?.jsonQuery ?? '{}');
        expect(request).not.toHaveProperty('item');
    });

    it('stores each item under its own hash', () => {
        // Given two merchants on the same graph and filters
        const buildForMerchant = (merchant: string) =>
            buildInsightsDetailsQuery({
                graphKey: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
                filters: FILTERS,
                itemGroupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                itemKey: merchant,
                periodEnd: undefined,
                topExpensesSnapshotHash: TOP_EXPENSES_SNAPSHOT_HASH,
            });

        // When their panels' queries are built, one of them twice
        const first = buildForMerchant('Anthropic');
        const again = buildForMerchant('Anthropic');
        const other = buildForMerchant('Uber');

        // Then reopening a panel finds its cached entry, while another merchant doesn't overwrite it
        expect(again?.hash).toBe(first?.hash);
        expect(other?.hash).not.toBe(first?.hash);
    });
});
