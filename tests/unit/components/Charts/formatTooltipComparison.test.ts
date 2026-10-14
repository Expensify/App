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
        const point: ChartDataPoint = {label: 'April', values: {[CHART_SERIES_KEY.PRIMARY]: 300, [CHART_SERIES_KEY.COMPARISON]: 100}, percentOfTotal: 34.2};

        // When the tooltip comparison for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then each series gets a row whose dot matches its line, and only April's own amount carries its share
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

        // Then each year gets a row named by its year, since a previous period has no single name, and each carries its own year's share
        expect(comparison?.rows).toEqual([
            {key: CHART_SERIES_KEY.PRIMARY, color: colors.green400, label: '2026', amount: '$300', percentage: '34.2%'},
            {key: CHART_SERIES_KEY.COMPARISON, color: colors.green200, label: '2025', amount: '$100', percentage: '16.1%'},
        ]);
    });

    it('leaves the tooltip as it is when a single series is plotted', () => {
        // Given a point of a chart that compares nothing
        const point: ChartDataPoint = {label: 'April', values: {[CHART_SERIES_KEY.PRIMARY]: 300}};

        // When the tooltip for that point is built
        const comparison = formatTooltipComparison(point, [{key: CHART_SERIES_KEY.PRIMARY}], formatAmount, 'en');

        // Then there is no comparison, so the tooltip keeps showing the amount and expense count
        expect(comparison).toBeUndefined();
    });

    it('leaves the tooltip as it is when the compared series has nothing at the point', () => {
        // Given April's spend, compared against an average that has no value for April
        const point: ChartDataPoint = {label: 'April', values: {[CHART_SERIES_KEY.PRIMARY]: 300}};

        // When the tooltip for that point is built
        const comparison = formatTooltipComparison(point, COMPARED_SERIES, formatAmount, 'en');

        // Then there is no comparison, so the tooltip shows April's amount and expense count rather than one unlabeled row
        expect(comparison).toBeUndefined();
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
});
