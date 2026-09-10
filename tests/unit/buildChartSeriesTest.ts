import type {ChartDataPoint} from '@components/Charts/types';
import {getSliceColorsByDataIndex, processDataIntoSlices} from '@components/Charts/utils';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {buildChartSeries, formatPercentOfTotal, getPercentOfTotal} from '@components/Search/buildChartSeries';
import type {TransactionMerchantGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem} from '@components/Search/types';

import CONST from '@src/CONST';

/** A grouped merchant result, carrying the fields the series is built from. */
function merchantGroup(merchant: string, total: number, count = 1): TransactionMerchantGroupListItemType {
    return {
        groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        merchant,
        formattedMerchant: merchant,
        keyForList: `group_${merchant}`,
        count,
        total,
        currency: CONST.CURRENCY.USD,
        transactions: [],
    };
}

const getLabel = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT ? (item.formattedMerchant ?? '') : '');
const getCurrencyDecimals = () => 2;

describe('buildChartSeries', () => {
    it('turns group totals in cents into plotted values, keeping the search order', () => {
        const data = [merchantGroup('Anthropic', 480000, 12), merchantGroup('Target', 190000, 41)];

        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.BAR, getLabel, getCurrencyDecimals});

        expect(rows.map((row) => row.point.label)).toEqual(['Anthropic', 'Target']);
        expect(rows.map((row) => row.point.total)).toEqual([4800, 1900]);
    });

    it('keeps each row pointing at the group it was built from', () => {
        const data = [merchantGroup('Anthropic', 480000), merchantGroup('Target', 190000)];

        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.LINE, getLabel, getCurrencyDecimals});

        expect(rows.at(0)?.item).toBe(data.at(0));
        expect(rows.at(1)?.item).toBe(data.at(1));
    });

    it('reads the compact axis label when the group-by provides one', () => {
        const data = [merchantGroup('Coffee Shop', 42000)];

        const rows = buildChartSeries({
            data,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getShortLabel: () => 'Coffee',
            getCurrencyDecimals,
        });

        expect(rows.at(0)?.point.shortLabel).toBe('Coffee');
    });

    it('leaves a line chart without per-group colors, since it draws a single series', () => {
        const data = [merchantGroup('Anthropic', 480000), merchantGroup('Target', 190000)];

        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.LINE, getLabel, getCurrencyDecimals});

        expect(rows.every((row) => row.color === undefined)).toBe(true);
    });

    it('colors bars by their position, the way the bar canvas does', () => {
        const data = [merchantGroup('Anthropic', 190000), merchantGroup('Target', 480000)];

        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.BAR, getLabel, getCurrencyDecimals});

        expect(rows.map((row) => row.color)).toEqual([VictoryTheme.colors.getColor(0), VictoryTheme.colors.getColor(1)]);
    });

    it('colors pie rows by slice rank, not array order, when the data is unsorted', () => {
        const data = [merchantGroup('Small', 10000), merchantGroup('Large', 900000), merchantGroup('Medium', 50000)];

        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.PIE, getLabel, getCurrencyDecimals});

        // Large is the biggest slice, so it takes the first palette color regardless of its position.
        expect(rows.at(1)?.color).toBe(VictoryTheme.colors.getColor(0));
        expect(rows.at(2)?.color).toBe(VictoryTheme.colors.getColor(1));
        expect(rows.at(0)?.color).toBe(VictoryTheme.colors.getColor(2));
    });

    it('ranks pie colors by magnitude, so a large refund is not treated as the smallest slice', () => {
        const data = [merchantGroup('Refund', -900000), merchantGroup('Target', 190000)];

        const rows = buildChartSeries({data, view: CONST.SEARCH.VIEW.PIE, getLabel, getCurrencyDecimals});

        expect(rows.at(0)?.color).toBe(VictoryTheme.colors.getColor(0));
        expect(rows.at(1)?.color).toBe(VictoryTheme.colors.getColor(1));
    });

    it('returns nothing to plot for an empty result set', () => {
        expect(buildChartSeries({data: [], view: CONST.SEARCH.VIEW.PIE, getLabel, getCurrencyDecimals})).toEqual([]);
    });
});

describe('getPercentOfTotal', () => {
    it('returns the share the value makes up of the total', () => {
        expect(getPercentOfTotal(2500, 10000)).toBe(25);
    });

    it('measures magnitude, so a negative group still reports a positive share', () => {
        expect(getPercentOfTotal(-2500, 10000)).toBe(25);
        expect(getPercentOfTotal(2500, -10000)).toBe(25);
    });

    it('can exceed 100% when the value is bigger than the total', () => {
        expect(getPercentOfTotal(15000, 10000)).toBe(150);
    });

    it('returns undefined when there is no total to measure against', () => {
        expect(getPercentOfTotal(2500, 0)).toBeUndefined();
        expect(getPercentOfTotal(2500, undefined)).toBeUndefined();
    });

    it('treats a missing value as no share of the total', () => {
        expect(getPercentOfTotal(undefined, 10000)).toBe(0);
    });
});

describe('formatPercentOfTotal', () => {
    it('keeps one decimal place when the share has one', () => {
        expect(formatPercentOfTotal(40.14, CONST.LOCALES.EN)).toBe('40.1%');
        expect(formatPercentOfTotal(3.5, CONST.LOCALES.EN)).toBe('3.5%');
    });

    it('drops the decimal when the share is round, so it does not read as false precision', () => {
        expect(formatPercentOfTotal(30, CONST.LOCALES.EN)).toBe('30%');
        expect(formatPercentOfTotal(100, CONST.LOCALES.EN)).toBe('100%');
    });

    it('reports a share too small to round as "less than", not as zero', () => {
        expect(formatPercentOfTotal(0.03, CONST.LOCALES.EN)).toBe('<0.1%');
    });

    it('shows a genuinely zero share as zero', () => {
        expect(formatPercentOfTotal(0, CONST.LOCALES.EN)).toBe('0%');
    });

    it('uses the locale decimal separator rather than a hand-built string', () => {
        expect(formatPercentOfTotal(40.14, CONST.LOCALES.PL)).toBe('40,1%');
    });
});

describe('getSliceColorsByDataIndex', () => {
    it('agrees with the colors the pie canvas draws for the same data', () => {
        const points: ChartDataPoint[] = [
            {label: 'Small', total: 100},
            {label: 'Large', total: 9000},
            {label: 'Medium', total: 500},
        ];

        const colors = getSliceColorsByDataIndex(points);
        const slices = processDataIntoSlices(points, {centerX: 100, centerY: 100, radius: 100, innerRadius: 60});

        for (const slice of slices) {
            expect(colors.at(slice.originalIndex)).toBe(slice.color);
        }
    });

    it('returns nothing for an empty data set', () => {
        expect(getSliceColorsByDataIndex([])).toEqual([]);
    });
});
