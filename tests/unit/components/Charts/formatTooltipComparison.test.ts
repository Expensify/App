import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import formatTooltipComparison from '@components/Charts/utils/formatTooltipComparison';
import {CHART_SERIES_KEY} from '@components/Search/buildChartSeries';

import colors from '@styles/theme/colors';

import type {NonEmptyTuple} from 'type-fest';

const formatAmount = (value: number) => `$${value}`;

const COMPARED_SERIES: NonEmptyTuple<ChartSeries> = [
    {key: CHART_SERIES_KEY.PRIMARY, color: colors.green400},
    {key: CHART_SERIES_KEY.COMPARISON, color: colors.green200, label: 'Average'},
];

describe('formatTooltipComparison', () => {
    it('gives each compared series a row in its color, named by the series', () => {
        // Given April's spend, with its share of the period's spend, plotted against the average
        const point: ChartDataPoint = {
            label: 'April',
            values: {[CHART_SERIES_KEY.PRIMARY]: 300, [CHART_SERIES_KEY.COMPARISON]: 100},
            seriesPercentOfTotal: {[CHART_SERIES_KEY.PRIMARY]: 34.2},
        };

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then each series gets a row whose dot matches its line, and only April's own amount carries a share, since the average has none
        expect(comparison?.rows).toEqual([
            {key: CHART_SERIES_KEY.PRIMARY, color: colors.green400, label: undefined, amount: '$300', percentage: '34.2%'},
            {key: CHART_SERIES_KEY.COMPARISON, color: colors.green200, label: 'Average', amount: '$100', percentage: undefined},
        ]);
    });

    it("names each period's row by its dates and gives it its own period's share", () => {
        // Given April plotted for two years, each with its share of that year's spend
        const point: ChartDataPoint = {
            label: 'April',
            values: {[CHART_SERIES_KEY.PRIMARY]: 300, [CHART_SERIES_KEY.COMPARISON]: 100},
            seriesLabels: {[CHART_SERIES_KEY.PRIMARY]: '2026', [CHART_SERIES_KEY.COMPARISON]: '2025'},
            seriesPercentOfTotal: {[CHART_SERIES_KEY.PRIMARY]: 34.2, [CHART_SERIES_KEY.COMPARISON]: 16.1},
        };
        const series: NonEmptyTuple<ChartSeries> = [
            {key: CHART_SERIES_KEY.PRIMARY, color: colors.green400},
            {key: CHART_SERIES_KEY.COMPARISON, color: colors.green200},
        ];

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, series, formatAmount, 'en');

        // Then each row is named by the point's own label for that series, its year, and carries that year's share
        expect(comparison?.rows).toEqual([
            {key: CHART_SERIES_KEY.PRIMARY, color: colors.green400, label: '2026', amount: '$300', percentage: '34.2%'},
            {key: CHART_SERIES_KEY.COMPARISON, color: colors.green200, label: '2025', amount: '$100', percentage: '16.1%'},
        ]);
    });

    it("colors a bar's rows like its own bars rather than like the series", () => {
        // Given a blue bar and its lighter average bar, where the compared series keeps the line's color
        const point: ChartDataPoint = {
            label: 'Amazon',
            values: {[CHART_SERIES_KEY.PRIMARY]: 300, [CHART_SERIES_KEY.COMPARISON]: 100},
            seriesColors: {[CHART_SERIES_KEY.PRIMARY]: colors.blue400, [CHART_SERIES_KEY.COMPARISON]: colors.blue200},
        };
        const series: NonEmptyTuple<ChartSeries> = [{key: CHART_SERIES_KEY.PRIMARY}, {key: CHART_SERIES_KEY.COMPARISON, color: colors.green200, label: 'Average'}];

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, series, formatAmount, 'en');

        // Then the dots match the bars drawn: the bar's own blue, and a lighter blue for the average amount
        expect(comparison?.rows.map((row) => row.color)).toEqual([colors.blue400, colors.blue200]);
    });

    it('leaves the tooltip as it is when a single series is plotted', () => {
        // Given a point of a chart that compares nothing
        const point: ChartDataPoint = {label: 'April', values: {[CHART_SERIES_KEY.PRIMARY]: 300}};

        // When the tooltip for that point is built
        const comparison = formatTooltipComparison(point, [{key: CHART_SERIES_KEY.PRIMARY}], formatAmount, 'en');

        // Then there is no comparison, so the tooltip keeps showing the amount and expense count
        expect(comparison).toBeUndefined();
    });

    it('leaves the tooltip as it is when the average has nothing at the point', () => {
        // Given April's spend, compared against an average that has no value for April
        const point: ChartDataPoint = {label: 'April', values: {[CHART_SERIES_KEY.PRIMARY]: 300}};

        // When the tooltip for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then there is no comparison, so the tooltip shows April's amount and expense count rather than one unnamed row
        expect(comparison).toBeUndefined();
    });

    it('drops the row of a previous period that has nothing at the point', () => {
        // Given October 31, which the shorter previous month has no day for
        const point: ChartDataPoint = {
            label: 'Oct 31',
            values: {[CHART_SERIES_KEY.PRIMARY]: 300},
            seriesLabels: {[CHART_SERIES_KEY.PRIMARY]: 'Oct 31, 2026'},
        };

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then only October 31's amount is listed, named by its date, with no change to show
        expect(comparison).toEqual({rows: [{key: CHART_SERIES_KEY.PRIMARY, color: colors.green400, label: 'Oct 31, 2026', amount: '$300', percentage: undefined}], change: undefined});
    });

    it('lists only the previous period where the current period has no bucket', () => {
        // Given January 31 plotted against February, which has no 31st
        const point: ChartDataPoint = {
            label: '31st',
            values: {[CHART_SERIES_KEY.COMPARISON]: 100},
            seriesLabels: {[CHART_SERIES_KEY.COMPARISON]: 'January 2026'},
        };

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then only January's amount is listed, named by its month, with no change to show
        expect(comparison).toEqual({rows: [{key: CHART_SERIES_KEY.COMPARISON, color: colors.green200, label: 'January 2026', amount: '$100', percentage: undefined}], change: undefined});
    });

    it('shows how much the primary series grew against the compared one', () => {
        // Given April spend three times the average
        const point: ChartDataPoint = {label: 'April', values: {[CHART_SERIES_KEY.PRIMARY]: 300, [CHART_SERIES_KEY.COMPARISON]: 100}};

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then the change reads as an increase of the difference, relative to the average
        expect(comparison?.change).toEqual({amount: '$200', percentage: '200%', isIncrease: true});
    });

    it('shows a drop below the compared series as a decrease', () => {
        // Given April spend at half the average
        const point: ChartDataPoint = {label: 'April', values: {[CHART_SERIES_KEY.PRIMARY]: 50, [CHART_SERIES_KEY.COMPARISON]: 100}};

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then the change is the unsigned difference, marked as a decrease
        expect(comparison?.change).toEqual({amount: '$50', percentage: '50%', isIncrease: false});
    });

    it('shows a dash for the percentage of spend that is new against nothing', () => {
        // Given April spend for a group with no spend in the compared period
        const point: ChartDataPoint = {label: 'April', values: {[CHART_SERIES_KEY.PRIMARY]: 300, [CHART_SERIES_KEY.COMPARISON]: 0}};

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then the change has no meaningful share of nothing, so a dash stands in for its percentage
        expect(comparison?.change).toEqual({amount: '$300', percentage: '—', isIncrease: true});
    });
});
