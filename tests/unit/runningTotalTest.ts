import {buildChartSeries, CHART_SERIES_KEY} from '@components/Search/buildChartSeries';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import applyRunningTotal from '@components/Search/runningTotal';
import type {TransactionMonthGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem} from '@components/Search/types';

import themeColors from '@styles/theme/colors';

import CONST from '@src/CONST';

import {translateLocal} from '../utils/TestHelper';

/** A grouped month result, carrying the fields the running total is built from. */
function monthGroup(year: number, month: number, total: number, count = 1, percentOfTotal?: number): TransactionMonthGroupListItemType {
    return {
        groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
        year,
        month,
        formattedMonth: `${month}/${year}`,
        shortFormattedMonth: `${month}`,
        sortKey: month,
        keyForList: `month_${year}_${month}`,
        count,
        total,
        currency: CONST.CURRENCY.USD,
        percentOfTotal,
        transactions: [],
    };
}

const MONTH = CONST.SEARCH.GROUP_BY.MONTH;
const getCurrencyDecimals = () => 2;

/** The chart rows a running-total line draws, in order, after accumulation. */
function runningRows(data: GroupedItem[], comparison?: ChartComparison) {
    const result = applyRunningTotal({data, comparison, groupBy: MONTH});
    return buildChartSeries({
        data: result.data,
        comparison: result.comparison,
        groupBy: MONTH,
        view: CONST.SEARCH.VIEW.LINE,
        getLabel: CHART_GROUP_BY_CONFIG[MONTH].getLabel,
        getCurrencyDecimals,
        translate: translateLocal,
        dateFnsLocale: undefined,
        colorScheme: CONST.COLOR_SCHEME.LIGHT,
    }).rows;
}

/** The plotted primary values of a running-total line, in the order the chart draws them. */
function runningValues(data: GroupedItem[], comparison?: ChartComparison) {
    return runningRows(data, comparison).map((row) => row.point);
}

describe('applyRunningTotal', () => {
    it('accumulates each period into the one before it, so the last point is the range total', () => {
        // Given three months of their own spend, in cents
        const data = [monthGroup(2026, 1, 100000), monthGroup(2026, 2, 200000), monthGroup(2026, 3, 300000)];

        // When the points are turned into a running total
        const points = runningValues(data);

        // Then each point is the spend so far, and the last equals the whole range (1000 + 2000 + 3000)
        expect(points.map((p) => p.values[CHART_SERIES_KEY.PRIMARY])).toEqual([1000, 3000, 6000]);
    });

    it('accumulates in date order however the search returned the rows', () => {
        // Given the same months returned newest first, as the headline query sorts them
        const data = [monthGroup(2026, 3, 300000), monthGroup(2026, 2, 200000), monthGroup(2026, 1, 100000)];

        // When the points are turned into a running total
        const points = runningValues(data);

        // Then the oldest month still starts the line, and the running values follow the search order
        expect(points.map((p) => p.values[CHART_SERIES_KEY.PRIMARY])).toEqual([6000, 3000, 1000]);
    });

    it('lets a refund lower the line rather than clamping it', () => {
        // Given a middle month with net negative spend from refunds
        const data = [monthGroup(2026, 1, 100000), monthGroup(2026, 2, -40000), monthGroup(2026, 3, 100000)];

        // When the points are turned into a running total
        const points = runningValues(data);

        // Then the running total dips at the refunded month and recovers after it
        expect(points.map((p) => p.values[CHART_SERIES_KEY.PRIMARY])).toEqual([1000, 600, 1600]);
    });

    it('carries the running share of the range total onto each point', () => {
        // Given two months that each make up half the range
        const data = [monthGroup(2026, 1, 100000, 2, 50), monthGroup(2026, 2, 100000, 3, 50)];

        // When the points are turned into a running total
        const points = runningValues(data);

        // Then the first point holds half the range and the last holds all of it, with the counts accumulated too
        expect(points.map((p) => p.percentOfTotal)).toEqual([50, 100]);
        expect(points.map((p) => p.count)).toEqual([2, 5]);
    });

    it('keeps the Average snapshot flat while the current line accumulates', () => {
        // Given three uneven months compared against an Average snapshot carrying the same value per bucket, keyed to the current rows
        const data = [monthGroup(2026, 1, 100000), monthGroup(2026, 2, 500000), monthGroup(2026, 3, 300000)];
        const comparison: ChartComparison = {
            data: [monthGroup(2026, 1, 200000), monthGroup(2026, 2, 200000), monthGroup(2026, 3, 200000)],
            color: themeColors.green200,
            label: 'Average',
        };

        // When the points are turned into a running total
        const rows = runningRows(data, comparison);

        // Then the Average keeps its per-bucket value, drawing a horizontal reference line under the climbing running total
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.COMPARISON])).toEqual([2000, 2000, 2000]);
        expect(rows.at(-1)?.point.values[CHART_SERIES_KEY.PRIMARY]).toBe(9000);
    });

    it('accumulates the compared period on its own, so point N of each line is each period so far', () => {
        // Given two months plotted against the two months before them
        const data = [monthGroup(2026, 3, 100000), monthGroup(2026, 4, 300000)];
        const comparison: ChartComparison = {
            data: [monthGroup(2026, 1, 200000), monthGroup(2026, 2, 200000)],
            color: themeColors.green200,
            periods: {primary: {start: '2026-03-01', end: '2026-04-30'}, comparison: {start: '2026-01-01', end: '2026-02-28'}, monthsApart: 2},
        };

        // When the points are turned into a running total
        const rows = runningRows(data, comparison);

        // Then each line accumulates from its own period's start, pairing point for point
        expect(rows.map((row) => row.point.values)).toEqual([
            {[CHART_SERIES_KEY.PRIMARY]: 1000, [CHART_SERIES_KEY.COMPARISON]: 2000},
            {[CHART_SERIES_KEY.PRIMARY]: 4000, [CHART_SERIES_KEY.COMPARISON]: 4000},
        ]);
    });

    it('keeps the running comparison climbing on a compared bucket no current bucket pairs with', () => {
        // Given two months plotted against a three-month period, whose last month pairs with nothing
        const data = [monthGroup(2026, 4, 100000), monthGroup(2026, 5, 300000)];
        const comparison: ChartComparison = {
            data: [monthGroup(2026, 1, 200000), monthGroup(2026, 2, 200000), monthGroup(2026, 3, 100000)],
            color: themeColors.green200,
            periods: {primary: {start: '2026-04-01', end: '2026-05-31'}, comparison: {start: '2026-01-01', end: '2026-03-31'}},
        };

        // When the points are turned into a running total
        const rows = runningRows(data, comparison);

        // Then the unpaired third month draws as its own trailing point, carrying the comparison's full running total
        expect(rows.map((row) => row.point.values)).toEqual([
            {[CHART_SERIES_KEY.PRIMARY]: 1000, [CHART_SERIES_KEY.COMPARISON]: 2000},
            {[CHART_SERIES_KEY.PRIMARY]: 4000, [CHART_SERIES_KEY.COMPARISON]: 4000},
            {[CHART_SERIES_KEY.COMPARISON]: 5000},
        ]);
    });

    it('handles a single period, pairing the one Average point with the one current point', () => {
        // Given one month compared against an Average snapshot of that same bucket
        const data = [monthGroup(2026, 1, 100000)];
        const comparison: ChartComparison = {data: [monthGroup(2026, 1, 100000)], color: themeColors.green200, label: 'Average'};

        // When the points are turned into a running total
        const rows = runningRows(data, comparison);

        // Then the single running point pairs the month with its untouched Average snapshot
        expect(rows.map((row) => row.point.values)).toEqual([{[CHART_SERIES_KEY.PRIMARY]: 1000, [CHART_SERIES_KEY.COMPARISON]: 1000}]);
    });
});
