import type {ChartDataPoint} from '@components/Charts/types';
import {processDataIntoSlices} from '@components/Charts/utils';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {buildChartSeries, getSliceColorsByDataIndex} from '@components/Search/buildChartSeries';
import type {TransactionMerchantGroupListItemType, TransactionQuarterGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem} from '@components/Search/types';

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

const getLabel = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT ? (item.formattedMerchant ?? '') : '');
const getCurrencyDecimals = () => 2;

describe('buildChartSeries', () => {
    it('turns group totals in cents into plotted values, keeping the search order', () => {
        // Given merchant groups whose totals arrive from the search as cents
        const data = [merchantGroup('Person', 480000, 12), merchantGroup('Target', 190000, 41)];

        // When the series is built for a bar chart
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.BAR, getLabel, getCurrencyDecimals});

        // Then every value is scaled down to the currency unit, because the chart axis reads in dollars, not cents,
        // and the rows stay in the order the search returned so the chart and the inline table line up row for row
        expect(rows.map((row) => row.point.label)).toEqual(['Person', 'Target']);
        expect(rows.map((row) => row.point.total)).toEqual([4800, 1900]);
    });

    it('keeps each row pointing at the group it was built from', () => {
        // Given two merchant groups returned by the search
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];

        // When the series is built for a line chart
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.LINE, getLabel, getCurrencyDecimals});

        // Then each row still references its own group object, because pressing a row has to open that group's
        // transactions and a copied object would lose the identity the rest of Search matches on
        expect(rows.at(0)?.item).toBe(data.at(0));
        expect(rows.at(1)?.item).toBe(data.at(1));
    });

    it('reads the compact axis label when the group-by provides one', () => {
        // Given a group whose full label is too long to fit under a bar
        const data = [merchantGroup('Coffee Shop', 42000)];

        // When the series is built with a group-by that offers a shortened label
        const rows = buildChartSeries({
            data,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getShortLabel: () => 'Coffee',
            getCurrencyDecimals,
        });

        // Then the short label is carried on the point, because the axis renders that one instead of truncating
        // the full label itself
        expect(rows.at(0)?.point.shortLabel).toBe('Coffee');
    });

    it('leaves a line chart without per-group colors, since it draws a single series', () => {
        // Given two merchant groups
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];

        // When the series is built for a line chart
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.LINE, getLabel, getCurrencyDecimals});

        // Then no row carries a color, because a line chart draws one continuous stroke and the inline table
        // must not show color swatches that nothing on the canvas corresponds to
        expect(rows.every((row) => row.color === undefined)).toBe(true);
    });

    it('colors bars by their position, the way the bar canvas does', () => {
        // Given groups that are not sorted by total
        const data = [merchantGroup('Person', 190000), merchantGroup('Target', 480000)];

        // When the series is built for a bar chart
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.BAR, getLabel, getCurrencyDecimals});

        // Then colors follow the array order rather than the totals, because that is how the bar canvas assigns
        // them and the inline table swatches have to match what is drawn
        expect(rows.map((row) => row.color)).toEqual([VictoryTheme.colors.getColor(0), VictoryTheme.colors.getColor(1)]);
    });

    it('colors pie rows by slice rank, not array order, when the data is unsorted', () => {
        // Given groups whose totals do not follow the order the search returned them in
        const data = [merchantGroup('Small', 10000), merchantGroup('Large', 900000), merchantGroup('Medium', 50000)];

        // When the series is built for a pie chart
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.PIE, getLabel, getCurrencyDecimals});

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
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.PIE, getLabel, getCurrencyDecimals});

        // Then the refund is ranked first, because the pie draws slices sized by absolute value and ranking on the
        // signed total would push the biggest slice to the end of the palette
        expect(rows.at(0)?.color).toBe(VictoryTheme.colors.getColor(0));
        expect(rows.at(1)?.color).toBe(VictoryTheme.colors.getColor(1));
    });

    it('carries the share the search reported onto the plotted point', () => {
        // Given merchant groups the search reported shares for
        const data = [merchantGroup('Person', 480000, 12, 71.6), merchantGroup('Target', 190000, 41, 28.4)];

        // When the series is built for a pie chart
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.PIE, getLabel, getCurrencyDecimals});

        // Then the point carries the backend share untouched, because the chart tooltip and the inline table both
        // read it from here and recomputing it in either place is what let them disagree
        expect(rows.map((row) => row.point.percentOfTotal)).toEqual([71.6, 28.4]);
    });

    it('leaves the share off for groups the search reports none for', () => {
        // Given quarter buckets, which come back without a share of the total
        const data = [quarterGroup(1, 75000), quarterGroup(2, 25000)];

        // When the series is built for a line chart
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.LINE, getLabel, getCurrencyDecimals});

        // Then the point carries no share, because the only share we quote is the one the search measured against
        // its own total, and a share derived from the groups on hand would disagree with it as soon as the
        // result set is truncated
        expect(rows.every((row) => row.point.percentOfTotal === undefined)).toBe(true);
    });

    it('returns nothing to plot for an empty result set', () => {
        // Given a search that matched no transactions
        const data: GroupedItem[] = [];

        // When the series is built for a pie chart
        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.PIE, getLabel, getCurrencyDecimals});

        // Then there is nothing to plot, because the empty state is the view's job and the chart must not be handed
        // placeholder rows to draw
        expect(rows).toEqual([]);
    });
});

describe('getSliceColorsByDataIndex', () => {
    it('agrees with the colors the pie canvas draws for the same data', () => {
        // Given points whose totals are out of order, so slice rank and array index differ
        const points: ChartDataPoint[] = [
            {label: 'Small', total: 100},
            {label: 'Large', total: 9000},
            {label: 'Medium', total: 500},
        ];

        // When the colors are resolved back to the order the data came in
        const colors = getSliceColorsByDataIndex(points);

        // Then every color matches the slice the canvas actually draws for that point, because the inline table and
        // the pie are colored by two separate code paths and a mismatch would silently mislabel the legend
        const slices = processDataIntoSlices(points, {centerX: 100, centerY: 100, radius: 100, innerRadius: 60});
        for (const slice of slices) {
            expect(colors.at(slice.originalIndex)).toBe(slice.color);
        }
    });

    it('leaves a group the donut does not draw without a color', () => {
        // Given a group whose share the table prints as ~0%, so the donut leaves its slice out
        const points: ChartDataPoint[] = [
            {label: 'Large', total: 10000, percentOfTotal: 99.99},
            {label: 'Sliver', total: 1, percentOfTotal: 0.01},
        ];

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
        const points: ChartDataPoint[] = [
            {label: 'Spend', total: 5000, percentOfTotal: 5000},
            {label: 'Rounding', total: 400, percentOfTotal: 0.01},
            {label: 'Refund', total: -4900, percentOfTotal: -4900},
        ];

        // When the colors are resolved back to the order the data came in
        const colors = getSliceColorsByDataIndex(points);

        // Then the two drawn groups take the first two palette entries, matching what the canvas colors them,
        // because `processDataIntoSlices` colors by position among the slices it actually draws
        const slices = processDataIntoSlices(points, {centerX: 100, centerY: 100, radius: 100, innerRadius: 60});
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
