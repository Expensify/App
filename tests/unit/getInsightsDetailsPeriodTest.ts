import getInsightsDetailsPeriod from '@pages/Insights/details/getInsightsDetailsPeriod';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';

const BASE_FILTERS: InsightsFilters = {date: {preset: CONST.SEARCH.DATE_PRESETS.THIS_YEAR}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.QUARTER, groupCurrency: CONST.CURRENCY.USD};

describe('getInsightsDetailsPeriod', () => {
    it.each([
        [CONST.SEARCH.DATE_PRESETS.THIS_WEEK, CONST.SEARCH.GROUP_BY.WEEK],
        [CONST.SEARCH.DATE_PRESETS.LAST_WEEK, CONST.SEARCH.GROUP_BY.WEEK],
        [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.GROUP_BY.MONTH],
        [CONST.SEARCH.DATE_PRESETS.LAST_MONTH, CONST.SEARCH.GROUP_BY.MONTH],
        [CONST.SEARCH.DATE_PRESETS.THIS_QUARTER, CONST.SEARCH.GROUP_BY.QUARTER],
        [CONST.SEARCH.DATE_PRESETS.LAST_QUARTER, CONST.SEARCH.GROUP_BY.QUARTER],
    ])('uses the period the %s preset covers on ranking graphs', (preset, expectedPeriod) => {
        // Given a date preset that covers exactly one period, with a Group by that differs from it
        const filters: InsightsFilters = {...BASE_FILTERS, date: {preset}, groupBy: CONST.SEARCH.GROUP_BY.DAY};

        // When a point on a ranking graph opens the Details panel
        const period = getInsightsDetailsPeriod(filters, CONST.INSIGHTS.GRAPH.TOP_MERCHANTS);

        // Then the panel works in the preset's own period, since the whole range is that one period
        expect(period).toBe(expectedPeriod);
    });

    it.each([
        CONST.SEARCH.DATE_PRESETS.THIS_YEAR,
        CONST.SEARCH.DATE_PRESETS.LAST_YEAR,
        CONST.SEARCH.DATE_PRESETS.LAST_30_DAYS,
        CONST.SEARCH.DATE_PRESETS.LAST_90_DAYS,
        CONST.SEARCH.DATE_PRESETS.LAST_6_MONTHS,
        CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS,
    ])('follows the Spend over time Group by for the %s preset on ranking graphs', (preset) => {
        // Given a year or rolling preset with Group by set to week, which every one of these ranges offers
        const filters: InsightsFilters = {...BASE_FILTERS, date: {preset}, groupBy: CONST.SEARCH.GROUP_BY.WEEK};

        // When a point on a ranking graph opens the Details panel
        const period = getInsightsDetailsPeriod(filters, CONST.INSIGHTS.GRAPH.TOP_SPENDERS);

        // Then the panel follows Group by, since these ranges have no single period of their own
        expect(period).toBe(CONST.SEARCH.GROUP_BY.WEEK);
    });

    it('follows the Spend over time Group by for a custom range on ranking graphs', () => {
        // Given a custom range of about six months grouped by month
        const filters: InsightsFilters = {...BASE_FILTERS, date: {from: '2026-01-01', to: '2026-06-30'}, groupBy: CONST.SEARCH.GROUP_BY.MONTH};

        // When a point on a ranking graph opens the Details panel
        const period = getInsightsDetailsPeriod(filters, CONST.INSIGHTS.GRAPH.TOP_CATEGORIES);

        // Then the panel follows Group by, since a custom range has no period of its own
        expect(period).toBe(CONST.SEARCH.GROUP_BY.MONTH);
    });

    it('uses days for a custom date', () => {
        // Given a single custom date
        const filters: InsightsFilters = {...BASE_FILTERS, date: {on: '2026-03-15'}};

        // When a point on a ranking graph opens the Details panel
        const period = getInsightsDetailsPeriod(filters, CONST.INSIGHTS.GRAPH.TOP_MERCHANTS);

        // Then the panel works in days, the only period a single date fits
        expect(period).toBe(CONST.SEARCH.GROUP_BY.DAY);
    });

    it('uses the drawn Group by on Spend over time, even for a preset with a period of its own', () => {
        // Given This month drawn by week on Spend over time
        const filters: InsightsFilters = {...BASE_FILTERS, date: {preset: CONST.SEARCH.DATE_PRESETS.THIS_MONTH}, groupBy: CONST.SEARCH.GROUP_BY.WEEK};

        // When a point on Spend over time opens the Details panel
        const period = getInsightsDetailsPeriod(filters, CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME);

        // Then the panel works in the clicked point's period, a week, not the month the preset covers
        expect(period).toBe(CONST.SEARCH.GROUP_BY.WEEK);
    });
});
