import type {ChartDataPoint} from '@components/Charts/types';
import {getSeriesValue, processDataIntoSlices} from '@components/Charts/utils';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {buildChartSeries, CHART_SERIES_KEY, getSliceColorsByDataIndex} from '@components/Search/buildChartSeries';
import type {TransactionMerchantGroupListItemType, TransactionQuarterGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {ChartView, GroupedItem, SearchGroupBy} from '@components/Search/types';

import CONST from '@src/CONST';

/** A grouped merchant result, carrying the fields the series is built from. */
function merchantGroup(merchant: string, total: number, count = 1, percentOfTotal?: number): TransactionMerchantGroupListItemType {
    return {
        groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        merchant,
        formattedMerchant: merchant,
        keyForList: `group_${merchant}`,
        count,
        total,
        currency: CONST.CURRENCY.USD,
        percentOfTotal,
        transactions: [],
    };
}

/** A grouped quarter result, the shape of group the search still returns without a share of the total. */
function quarterGroup(quarter: number, total: number): TransactionQuarterGroupListItemType {
    return {
        groupedBy: CONST.SEARCH.GROUP_BY.QUARTER,
        year: 2026,
        quarter,
        formattedQuarter: `Q${quarter} 2026`,
        shortFormattedQuarter: `Q${quarter}`,
        sortKey: quarter,
        keyForList: `group_2026_Q${quarter}`,
        count: 1,
        total,
        currency: CONST.CURRENCY.USD,
        transactions: [],
    };
}

/** The same quarter bucket a year earlier, which the compared period returns. */
function previousQuarterGroup(quarter: number, total: number): TransactionQuarterGroupListItemType {
    return {...quarterGroup(quarter, total), year: 2025, keyForList: `group_2025_Q${quarter}`};
}

const getLabel = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT ? (item.formattedMerchant ?? '') : '');
const getCurrencyDecimals = () => 2;

/** Builds the rows of a chart plotting one period, which is every case but a comparison. */
function buildRows(data: GroupedItem[], view: ChartView, getShortLabel?: (item: GroupedItem) => string | undefined) {
    return buildChartSeries({primary: {rows: data}, view, groupBy: CONST.SEARCH.GROUP_BY.MERCHANT, getLabel, getShortLabel, getCurrencyDecimals}).rows;
}

/** The amount the chart plots for a row's period on screen. */
function getPlottedValue(point: ChartDataPoint) {
    return getSeriesValue(point, CHART_SERIES_KEY.PRIMARY);
}

/** A point as the chart reads it, plotting one period. */
function point(label: string, total: number, percentOfTotal?: number): ChartDataPoint {
    return {label, values: {[CHART_SERIES_KEY.PRIMARY]: total}, percentOfTotal};
}

describe('buildChartSeries', () => {
    it('turns group totals in cents into plotted values, keeping the search order', () => {
        // Given merchant groups whose totals arrive from the search as cents
        const data = [merchantGroup('Person', 480000, 12), merchantGroup('Target', 190000, 41)];

        // When the series is built for a bar chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.BAR);

        // Then every value is scaled down to the currency unit, because the chart axis reads in dollars, not cents,
        // and the rows stay in the order the search returned so the chart and the inline table line up row for row
        expect(rows.map((row) => row.point.label)).toEqual(['Person', 'Target']);
        expect(rows.map((row) => getPlottedValue(row.point))).toEqual([4800, 1900]);
    });

    it('keeps each row pointing at the group it was built from', () => {
        // Given two merchant groups returned by the search
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];

        // When the series is built for a line chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.LINE);

        // Then each row still references its own group object, because pressing a row has to open that group's
        // transactions and a copied object would lose the identity the rest of Search matches on
        expect(rows.at(0)?.item).toBe(data.at(0));
        expect(rows.at(1)?.item).toBe(data.at(1));
    });

    it('reads the compact axis label when the group-by provides one', () => {
        // Given a group whose full label is too long to fit under a bar
        const data = [merchantGroup('Coffee Shop', 42000)];

        // When the series is built with a group-by that offers a shortened label
        const rows = buildRows(data, CONST.SEARCH.VIEW.BAR, () => 'Coffee');

        // Then the short label is carried on the point, because the axis renders that one instead of truncating
        // the full label itself
        expect(rows.at(0)?.point.shortLabel).toBe('Coffee');
    });

    it('leaves a line chart without per-group colors, since it draws a single series', () => {
        // Given two merchant groups
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];

        // When the series is built for a line chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.LINE);

        // Then no row carries a color, because a line chart draws one continuous stroke and the inline table
        // must not show color swatches that nothing on the canvas corresponds to
        expect(rows.every((row) => row.color === undefined)).toBe(true);
    });

    it('colors bars by their position, the way the bar canvas does', () => {
        // Given groups that are not sorted by total
        const data = [merchantGroup('Person', 190000), merchantGroup('Target', 480000)];

        // When the series is built for a bar chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.BAR);

        // Then colors follow the array order rather than the totals, because that is how the bar canvas assigns
        // them and the inline table swatches have to match what is drawn
        expect(rows.map((row) => row.color)).toEqual([VictoryTheme.colors.getColor(0), VictoryTheme.colors.getColor(1)]);
    });

    it('colors pie rows by slice rank, not array order, when the data is unsorted', () => {
        // Given groups whose totals do not follow the order the search returned them in
        const data = [merchantGroup('Small', 10000), merchantGroup('Large', 900000), merchantGroup('Medium', 50000)];

        // When the series is built for a pie chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.PIE);

        // Then each row takes the palette color of its slice, because the pie canvas sorts slices by size before
        // coloring them, so `Large` gets the first color regardless of sitting second in the array
        expect(rows.at(1)?.color).toBe(VictoryTheme.colors.getColor(0));
        expect(rows.at(2)?.color).toBe(VictoryTheme.colors.getColor(1));
        expect(rows.at(0)?.color).toBe(VictoryTheme.colors.getColor(2));
    });

    it('ranks pie colors by magnitude, so a large refund is not treated as the smallest slice', () => {
        // Given a group with a large negative total, which a refund produces
        const data = [merchantGroup('Refund', -900000), merchantGroup('Target', 190000)];

        // When the series is built for a pie chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.PIE);

        // Then the refund is ranked first, because the pie draws slices sized by absolute value and ranking on the
        // signed total would push the biggest slice to the end of the palette
        expect(rows.at(0)?.color).toBe(VictoryTheme.colors.getColor(0));
        expect(rows.at(1)?.color).toBe(VictoryTheme.colors.getColor(1));
    });

    it('carries the share the search reported onto the plotted point', () => {
        // Given merchant groups the search reported shares for
        const data = [merchantGroup('Person', 480000, 12, 71.6), merchantGroup('Target', 190000, 41, 28.4)];

        // When the series is built for a pie chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.PIE);

        // Then the point carries the backend share untouched, because the chart tooltip and the inline table both
        // read it from here and recomputing it in either place is what let them disagree
        expect(rows.map((row) => row.point.percentOfTotal)).toEqual([71.6, 28.4]);
    });

    it('leaves the share off for groups the search reports none for', () => {
        // Given quarter buckets, which come back without a share of the total
        const data = [quarterGroup(1, 75000), quarterGroup(2, 25000)];

        // When the series is built for a line chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.LINE);

        // Then the point carries no share, because the only share we quote is the one the search measured against
        // its own total, and a share derived from the groups on hand would disagree with it as soon as the
        // result set is truncated
        expect(rows.every((row) => row.point.percentOfTotal === undefined)).toBe(true);
    });

    it('returns nothing to plot for an empty result set', () => {
        // Given a search that matched no transactions
        const data: GroupedItem[] = [];

        // When the series is built for a pie chart
        const rows = buildRows(data, CONST.SEARCH.VIEW.PIE);

        // Then there is nothing to plot, because the empty state is the view's job and the chart must not be handed
        // placeholder rows to draw
        expect(rows).toEqual([]);
    });
});

describe('getSliceColorsByDataIndex', () => {
    it('agrees with the colors the pie canvas draws for the same data', () => {
        // Given points whose totals are out of order, so slice rank and array index differ
        const points: ChartDataPoint[] = [point('Small', 100), point('Large', 9000), point('Medium', 500)];

        // When the colors are resolved back to the order the data came in
        const colors = getSliceColorsByDataIndex(points);

        // Then every color matches the slice the canvas actually draws for that point, because the inline table and
        // the pie are colored by two separate code paths and a mismatch would silently mislabel the legend
        const slices = processDataIntoSlices(points, CHART_SERIES_KEY.PRIMARY, {centerX: 100, centerY: 100, radius: 100, innerRadius: 60});
        for (const slice of slices) {
            expect(colors.at(slice.originalIndex)).toBe(slice.color);
        }
    });

    it('leaves a group the donut does not draw without a color', () => {
        // Given a group whose share the table prints as ~0%, so the donut leaves its slice out
        const points: ChartDataPoint[] = [point('Large', 10000, 99.99), point('Sliver', 1, 0.01)];

        // When the colors are resolved back to the order the data came in
        const colors = getSliceColorsByDataIndex(points);

        // Then the sliver gets no color while the drawn slice keeps its own, because a swatch in the table would
        // send the reader looking for a slice that is not on the canvas
        expect(colors.at(0)).toBe(VictoryTheme.colors.getColor(0));
        expect(colors.at(1)).toBeUndefined();
    });

    it('ranks the palette over the drawn slices only', () => {
        // Given a dropped group that is not the smallest slice by absolute value, so ranking before dropping would
        // hand the drawn slices the wrong palette entries
        const points: ChartDataPoint[] = [point('Spend', 5000, 5000), point('Rounding', 400, 0.01), point('Refund', -4900, -4900)];

        // When the colors are resolved back to the order the data came in
        const colors = getSliceColorsByDataIndex(points);

        // Then the two drawn groups take the first two palette entries, matching what the canvas colors them,
        // because `processDataIntoSlices` colors by position among the slices it actually draws
        const slices = processDataIntoSlices(points, CHART_SERIES_KEY.PRIMARY, {centerX: 100, centerY: 100, radius: 100, innerRadius: 60});
        for (const slice of slices) {
            expect(colors.at(slice.originalIndex)).toBe(slice.color);
        }
        expect(colors.at(1)).toBeUndefined();
    });

    it('returns nothing for an empty data set', () => {
        // Given a chart with no points, which happens while a search is still loading
        const points: ChartDataPoint[] = [];

        // When the colors are resolved
        const colors = getSliceColorsByDataIndex(points);

        // Then no colors come back, because the caller indexes into this array per row and a padded array would
        // hand a color to a row that does not exist
        expect(colors).toEqual([]);
    });
});

describe('buildChartSeries with a compared period', () => {
    const CURRENT_WINDOW_START = '2026-01-01';
    const PREVIOUS_WINDOW_START = '2025-01-01';

    /** Builds the model of a chart plotting one period against the one before it. */
    function buildComparison(rows: GroupedItem[], previousRows: GroupedItem[], groupBy: SearchGroupBy) {
        return buildChartSeries({
            primary: {rows, label: 'YTD 2026', color: '#current', start: CURRENT_WINDOW_START},
            comparison: {rows: previousRows, label: 'YTD 2025', color: '#previous', start: PREVIOUS_WINDOW_START},
            view: CONST.SEARCH.VIEW.BAR,
            groupBy,
            getLabel: (item) =>
                item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT ? (item.formattedMerchant ?? '') : item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? (item.formattedQuarter ?? '') : '',
            getCurrencyDecimals,
        });
    }

    it('names both periods, so the legend and the tooltip can tell them apart', () => {
        // Given a period plotted against the one before it
        const model = buildComparison([merchantGroup('Person', 480000)], [merchantGroup('Person', 240000)], CONST.SEARCH.GROUP_BY.MERCHANT);

        // Then each series carries the name and color of the period it draws
        expect(model.series).toEqual([
            {key: CHART_SERIES_KEY.PRIMARY, label: 'YTD 2026', color: '#current'},
            {key: CHART_SERIES_KEY.COMPARISON, label: 'YTD 2025', color: '#previous'},
        ]);
    });

    it('pairs ranking rows by the group they describe, not by the order they were ranked in', () => {
        // Given the same two merchants ranked differently in each period
        const rows = [merchantGroup('Person', 300000), merchantGroup('Target', 100000)];
        const previousRows = [merchantGroup('Target', 250000), merchantGroup('Person', 50000)];

        // When the periods are plotted against each other
        const model = buildComparison(rows, previousRows, CONST.SEARCH.GROUP_BY.MERCHANT);

        // Then each merchant is measured against itself
        expect(model.rows.at(0)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 3000, [CHART_SERIES_KEY.COMPARISON]: 500});
        expect(model.rows.at(1)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 1000, [CHART_SERIES_KEY.COMPARISON]: 2500});
    });

    it('pairs time buckets by their position in their own period, so a gap cannot shift the rest', () => {
        // Given a period missing its second quarter, which a search returns no bucket for
        const rows = [quarterGroup(1, 100000), quarterGroup(3, 300000)];
        const previousRows = [previousQuarterGroup(1, 10000), previousQuarterGroup(2, 20000), previousQuarterGroup(3, 30000)];

        // When the two periods are plotted against each other
        const model = buildComparison(rows, previousRows, CONST.SEARCH.GROUP_BY.QUARTER);

        // Then Q1 meets Q1 and Q3 meets Q3, rather than Q3 sliding onto Q2
        expect(model.rows.at(0)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 1000, [CHART_SERIES_KEY.COMPARISON]: 100});
        expect(model.rows.at(1)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 3000, [CHART_SERIES_KEY.COMPARISON]: 300});
    });

    it('draws a group the compared period has nothing for at zero', () => {
        // Given a merchant that only appears in the period on screen
        const model = buildComparison([merchantGroup('Person', 300000)], [merchantGroup('Target', 250000)], CONST.SEARCH.GROUP_BY.MERCHANT);

        // Then its comparison bar is empty and no row is invented for it
        expect(model.rows).toHaveLength(1);
        expect(model.rows.at(0)?.point.values[CHART_SERIES_KEY.COMPARISON]).toBe(0);
        expect(model.rows.at(0)?.comparisonItem).toBeUndefined();
    });

    it('keeps the rows behind both values, so a press can be traced back to a period', () => {
        // Given a merchant present in both periods
        const primaryItem = merchantGroup('Person', 300000);
        const comparisonItem = merchantGroup('Person', 50000);

        // When the periods are plotted against each other
        const model = buildComparison([primaryItem], [comparisonItem], CONST.SEARCH.GROUP_BY.MERCHANT);

        // Then the row holds the grouped item each of its values was read from
        expect(model.rows.at(0)?.item).toBe(primaryItem);
        expect(model.rows.at(0)?.comparisonItem).toBe(comparisonItem);
    });

    it('leaves the per-group palette off, because color tells the two periods apart', () => {
        // Given two merchants plotted against the period before
        const model = buildComparison([merchantGroup('Person', 300000), merchantGroup('Target', 100000)], [], CONST.SEARCH.GROUP_BY.MERCHANT);

        // Then no row carries a color of its own, since every bar takes the color of the period it belongs to
        expect(model.rows.every((row) => row.color === undefined)).toBe(true);
    });
});
