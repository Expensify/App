import type {ChartDataPoint} from '@components/Charts/types';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {buildChartSeries, CHART_SERIES_KEY, getSliceColorsByDataIndex} from '@components/Search/buildChartSeries';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {ChartComparisonPeriods} from '@components/Search/comparisonBuckets';
import type {
    TransactionDayGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionWeekGroupListItemType,
} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem, SearchGroupBy} from '@components/Search/types';

import themeColors from '@styles/theme/colors';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {translateLocal} from '../utils/TestHelper';

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
function quarterGroup(quarter: number, total: number, year = 2026, count = 1): TransactionQuarterGroupListItemType {
    return {
        groupedBy: CONST.SEARCH.GROUP_BY.QUARTER,
        year,
        quarter,
        formattedQuarter: `Q${quarter} ${year}`,
        shortFormattedQuarter: `Q${quarter}`,
        sortKey: quarter,
        keyForList: `group_${year}_Q${quarter}`,
        count,
        total,
        currency: CONST.CURRENCY.USD,
        transactions: [],
    };
}

const getLabel = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT ? (item.formattedMerchant ?? '') : '');
const getCurrencyDecimals = () => 2;

/** A point as the chart reads it, plotting one series. */
function point(label: string, total: number, percentOfTotal?: number): ChartDataPoint {
    return {label, values: {[CHART_SERIES_KEY.PRIMARY]: total}, percentOfTotal};
}

describe('buildChartSeries', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    it('turns group totals in cents into plotted values, keeping the search order', () => {
        // Given merchant groups whose totals arrive from the search as cents
        const data = [merchantGroup('Person', 480000, 12), merchantGroup('Target', 190000, 41)];

        // When the series is built for a bar chart
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then every value is scaled down to the currency unit, because the chart axis reads in dollars, not cents,
        // and the rows stay in the order the search returned so the chart and the inline table line up row for row
        expect(rows.map((row) => row.point.label)).toEqual(['Person', 'Target']);
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.PRIMARY])).toEqual([4800, 1900]);
    });

    it('plots every group as one primary series', () => {
        // Given merchant groups from a search that compares nothing
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];

        // When the series is built for a bar chart
        const {series, rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then a single primary series comes back and every point holds its amount under that series' key,
        // because the charts read each point's amount by the key of the series they draw
        expect(series).toEqual([{key: CHART_SERIES_KEY.PRIMARY}]);
        expect(rows.map((row) => row.point.values)).toEqual([{[CHART_SERIES_KEY.PRIMARY]: 4800}, {[CHART_SERIES_KEY.PRIMARY]: 1900}]);
    });

    it('keeps each row pointing at the group it was built from', () => {
        // Given two merchant groups returned by the search
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];

        // When the series is built for a line chart
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.LINE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then each row still references its own group object, because pressing a row has to open that group's
        // transactions and a copied object would lose the identity the rest of Search matches on
        expect(rows.at(0)?.item).toBe(data.at(0));
        expect(rows.at(1)?.item).toBe(data.at(1));
    });

    it('reads the compact axis label when the group-by provides one', () => {
        // Given a group whose full label is too long to fit under a bar
        const data = [merchantGroup('Coffee Shop', 42000)];

        // When the series is built with a group-by that offers a shortened label
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
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
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.LINE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then no row carries a color, because a line chart draws one continuous stroke and the inline table
        // must not show color swatches that nothing on the canvas corresponds to
        expect(rows.every((row) => row.point.color === undefined)).toBe(true);
    });

    it('colors bars by their position', () => {
        // Given groups that are not sorted by total
        const data = [merchantGroup('Person', 190000), merchantGroup('Target', 480000)];

        // When the series is built for a bar chart
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then colors follow the array order rather than the totals, so each bar keeps its color when the totals change
        expect(rows.map((row) => row.point.color)).toEqual([VictoryTheme.colors.getColor(0), VictoryTheme.colors.getColor(1)]);
    });

    it('colors pie rows by slice rank, not array order, when the data is unsorted', () => {
        // Given groups whose totals do not follow the order the search returned them in
        const data = [merchantGroup('Small', 10000), merchantGroup('Large', 900000), merchantGroup('Medium', 50000)];

        // When the series is built for a pie chart
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.PIE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then the palette follows the slices by size, so `Large` gets the first color regardless of sitting second in the array
        expect(rows.at(1)?.point.color).toBe(VictoryTheme.colors.getColor(0));
        expect(rows.at(2)?.point.color).toBe(VictoryTheme.colors.getColor(1));
        expect(rows.at(0)?.point.color).toBe(VictoryTheme.colors.getColor(2));
    });

    it('ranks pie colors by magnitude, so a large refund is not treated as the smallest slice', () => {
        // Given a group with a large negative total, which a refund produces
        const data = [merchantGroup('Refund', -900000), merchantGroup('Target', 190000)];

        // When the series is built for a pie chart
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.PIE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then the refund is ranked first, because the pie draws slices sized by absolute value and ranking on the
        // signed total would push the biggest slice to the end of the palette
        expect(rows.at(0)?.point.color).toBe(VictoryTheme.colors.getColor(0));
        expect(rows.at(1)?.point.color).toBe(VictoryTheme.colors.getColor(1));
    });

    it('carries the share the search reported onto the plotted point', () => {
        // Given merchant groups the search reported shares for
        const data = [merchantGroup('Person', 480000, 12, 71.6), merchantGroup('Target', 190000, 41, 28.4)];

        // When the series is built for a pie chart
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.PIE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then the point carries the backend share untouched, because the chart tooltip and the inline table both
        // read it from here and recomputing it in either place is what let them disagree
        expect(rows.map((row) => row.point.percentOfTotal)).toEqual([71.6, 28.4]);
    });

    it('leaves the share off for groups the search reports none for', () => {
        // Given quarter buckets, which come back without a share of the total
        const data = [quarterGroup(1, 75000), quarterGroup(2, 25000)];

        // When the series is built for a line chart
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.LINE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then the point carries no share, because the only share we quote is the one the search measured against
        // its own total, and a share derived from the groups on hand would disagree with it as soon as the
        // result set is truncated
        expect(rows.every((row) => row.point.percentOfTotal === undefined)).toBe(true);
    });

    it('returns nothing to plot for an empty result set', () => {
        // Given a search that matched no transactions
        const data: GroupedItem[] = [];

        // When the series is built for a pie chart
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.PIE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then there is nothing to plot, because the empty state is the view's job and the chart must not be handed
        // placeholder rows to draw
        expect(rows).toEqual([]);
    });

    it('plots each compared row against the group stored under the same key', () => {
        // Given three quarters and the compared total the search returned for each of them, as cents, out of order
        const data = [quarterGroup(1, 30000), quarterGroup(2, 60000), quarterGroup(3, 0)];
        const compared = [quarterGroup(3, 30000), quarterGroup(1, 30000), quarterGroup(2, 30000)];

        // When the series is built for a line chart compared against those rows
        const {series, rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            comparison: {data: compared, color: themeColors.green200},
            view: CONST.SEARCH.VIEW.LINE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then each point carries its own quarter's compared total in dollars, drawn in the compared color
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.COMPARISON])).toEqual([300, 300, 300]);
        expect(series).toEqual([{key: CHART_SERIES_KEY.PRIMARY}, {key: CHART_SERIES_KEY.COMPARISON, color: themeColors.green200}]);
    });

    it('leaves the compared value off a group the compared rows have nothing for', () => {
        // Given two quarters, where the compared rows hold only the first
        const data = [quarterGroup(1, 30000), quarterGroup(2, 60000)];

        // When the series is built for a line chart compared against those rows
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            comparison: {data: [quarterGroup(1, 45000)], color: themeColors.green200},
            view: CONST.SEARCH.VIEW.LINE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then the second quarter has no compared value, so the tooltip leaves its row out
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.COMPARISON])).toEqual([450, undefined]);
    });

    it('compares a ranked group the compared rows leave out against nothing spent', () => {
        // Given this month's top merchants, one of which had no spend last month, so last month's rows leave it out
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];
        const previousMonth = [merchantGroup('Person', 240000)];

        // When the series is built for a bar chart compared against last month
        const {rows} = buildChartSeries({
            data,
            comparison: {data: previousMonth, color: themeColors.green200},
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then the new merchant compares against $0, since a ranking only lists groups that spent, rather than drawing no bar
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.COMPARISON])).toEqual([2400, 0]);
    });

    it("shades each compared bar with its own bar's color", () => {
        // Given this month's top two merchants compared against last month
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];

        // When the series is built for a bar chart
        const {rows} = buildChartSeries({
            data,
            comparison: {data: [merchantGroup('Person', 240000), merchantGroup('Target', 90000)], color: themeColors.green200},
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then each pair shares its rank's hue, the compared bar lighter, rather than every compared bar taking the series' green
        expect(rows.map((row) => row.point.seriesColors)).toEqual([
            {[CHART_SERIES_KEY.PRIMARY]: themeColors.yellow400, [CHART_SERIES_KEY.COMPARISON]: themeColors.yellow200},
            {[CHART_SERIES_KEY.PRIMARY]: themeColors.tangerine400, [CHART_SERIES_KEY.COMPARISON]: themeColors.tangerine200},
        ]);
    });

    it('draws the average of a ranked chart as one line instead of a shaded bar per group', () => {
        // Given this period's top merchants and the all-merchant average, as cents
        const data = [merchantGroup('Person', 480000), merchantGroup('Target', 190000)];

        // When the series is built for a bar chart compared against the average
        const {series, rows} = buildChartSeries({
            data,
            comparison: {total: 43000},
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then every group carries the average in dollars, and the average series is marked to be drawn as a line, so no group gets a shaded bar for it
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.COMPARISON])).toEqual([430, 430]);
        expect(series.at(1)).toEqual({key: CHART_SERIES_KEY.COMPARISON, label: 'All-merchant average', isAverage: true});
        expect(rows.map((row) => row.point.seriesColors)).toEqual([{[CHART_SERIES_KEY.PRIMARY]: themeColors.yellow400}, {[CHART_SERIES_KEY.PRIMARY]: themeColors.tangerine400}]);
    });

    it('names each series by the period it covers when comparing periods', () => {
        // Given this month's merchants compared against last month
        const data = [merchantGroup('Person', 480000)];

        // When the series is built with the two periods
        const {series} = buildChartSeries({
            data,
            comparison: {
                data: [merchantGroup('Person', 240000)],
                color: themeColors.green200,
                periods: {primary: {start: '2026-10-01', end: '2026-10-31'}, comparison: {start: '2026-09-01', end: '2026-09-30'}},
            },
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then the tooltip can tell the two bars apart by their months, since neither period has a name of its own
        expect(series.map((seriesItem) => seriesItem.label)).toEqual(['October 2026', 'September 2026']);
    });

    it('relabels the group still collecting expenses, keeping its axis label', () => {
        // Given two quarter groups, the last of which is still in progress
        const data = [quarterGroup(3, 100000), quarterGroup(4, 20000)];
        const quarterLabel = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? item.formattedQuarter : '');

        // When the series is built with a label for the in-progress group
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.LINE,
            getLabel: quarterLabel,
            getCurrencyDecimals,
            getInProgressLabel: (item) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER && item.quarter === 4 ? 'Q4 so far' : undefined),
        });

        // Then only that group is marked and relabeled, and its axis still names the whole quarter
        expect(rows.map((row) => row.point.isInProgress)).toEqual([false, true]);
        expect(rows.at(1)?.point.label).toBe('Q4 so far');
        expect(rows.at(1)?.point.shortLabel).toBe('Q4 2026');
    });

    it('marks groups after the current period as not ended, keeping their own labels', () => {
        // Given a finished quarter, the quarter in progress, and a later quarter holding future-dated expenses
        const data = [quarterGroup(2, 100000), quarterGroup(3, 20000), quarterGroup(4, 5000)];
        const quarterLabel = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? item.formattedQuarter : '');

        // When the series is built knowing which group is in progress and which come later
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.LINE,
            getLabel: quarterLabel,
            getCurrencyDecimals,
            getInProgressLabel: (item) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER && item.quarter === 3 ? 'Q3 so far' : undefined),
            isLaterPeriod: (item) => item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER && item.quarter === 4,
        });

        // Then both periods that haven't ended are marked, so the line chart draws them dashed, and only the current one says "so far"
        expect(rows.map((row) => row.point.isInProgress)).toEqual([false, true, true]);
        expect(rows.map((row) => row.point.label)).toEqual(['Q2 2026', 'Q3 so far', 'Q4 2026']);
    });
});

describe('buildChartSeries with the count metric', () => {
    it('plots how many expenses each group holds instead of what it totals', () => {
        // Given merchant groups the search ranked by spend, where the bigger spender is not the busier merchant
        const data = [merchantGroup('Person', 480000, 12), merchantGroup('Target', 190000, 41)];

        // When the series is built for a chart plotting counts
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then each value is the group's own count, untouched, because a count has no currency to scale down from
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.PRIMARY])).toEqual([12, 41]);
    });

    it('stops carrying the expense count beside the value, since the value is already that count', () => {
        // Given merchant groups plotted by how many expenses they hold
        const data = [merchantGroup('Person', 480000, 12), merchantGroup('Target', 190000, 41)];

        // When the series is built for a chart plotting counts
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then no point carries one, because the tooltip prints it as a second line and would read "41" above "41 expenses"
        expect(rows.every((row) => row.point.count === undefined)).toBe(true);
    });

    it('counts the compared rows too, so a baseline is read in the same metric as the chart', () => {
        // Given two quarters and the compared rows for each, where the compared counts and totals rank differently
        const data = [quarterGroup(1, 30000, 2026, 9), quarterGroup(2, 60000, 2026, 4)];
        const compared = [quarterGroup(1, 30000, 2026, 6), quarterGroup(2, 30000, 2026, 5)];

        // When the series is built for a line chart comparing counts against the compared rows
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            comparison: {data: compared, color: themeColors.green200},
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
            view: CONST.SEARCH.VIEW.LINE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then both series read counts, because a baseline drawn in dollars against a line drawn in expenses
        // would put the two on one axis that measures neither, and the delta between them would mean nothing
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.PRIMARY])).toEqual([9, 4]);
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.COMPARISON])).toEqual([6, 5]);
    });

    it('drops the average from a chart of counts, since the average the search returns is one of spend', () => {
        // Given merchant groups plotted by how many expenses they hold, and the all-merchant average spend
        const data = [merchantGroup('Person', 480000, 12), merchantGroup('Target', 190000, 41)];

        // When the series is built for a bar chart plotting counts against the average
        const {series, rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            comparison: {total: 43000},
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then only the primary series is drawn, because a line at $430 on an axis counting expenses would measure neither
        expect(series).toHaveLength(1);
        expect(rows.every((row) => row.point.values[CHART_SERIES_KEY.COMPARISON] === undefined)).toBe(true);
    });

    it('names the money each group totals beside its count, since a count says nothing about the spend behind it', () => {
        // Given merchant groups plotted by how many expenses they hold
        const data = [merchantGroup('Person', 480000, 12), merchantGroup('Target', 190000, 41)];

        // When the series is built for a chart plotting counts, with a formatter for the money a group totals
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
            formatTotal: (total) => `$${total / 100}`,
        });

        // Then each point carries its group's total, which the tooltip and the table write in the parentheses the share would have held
        expect(rows.map((row) => row.point.seriesTotals?.[CHART_SERIES_KEY.PRIMARY])).toEqual(['$4800', '$1900']);
    });

    it("names the compared period's own total too, so each row in a comparison says what it was worth", () => {
        // Given two quarters plotted by count against the compared rows for each
        const data = [quarterGroup(1, 30000, 2026, 9), quarterGroup(2, 60000, 2026, 4)];
        const compared = [quarterGroup(1, 30000, 2026, 6), quarterGroup(2, 45000, 2026, 5)];

        // When the series is built for a line chart comparing counts against the compared rows
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            comparison: {data: compared, color: themeColors.green200},
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
            view: CONST.SEARCH.VIEW.LINE,
            getLabel,
            getCurrencyDecimals,
            formatTotal: (total) => `$${total / 100}`,
        });

        // Then both series carry their own totals, because a row quoting the other series' spend would misname its own count
        expect(rows.map((row) => row.point.seriesTotals?.[CHART_SERIES_KEY.PRIMARY])).toEqual(['$300', '$600']);
        expect(rows.map((row) => row.point.seriesTotals?.[CHART_SERIES_KEY.COMPARISON])).toEqual(['$300', '$450']);
    });

    it('leaves the totals off an amount chart, whose values are already the money', () => {
        // Given merchant groups plotted by what they total, with no formatter for a second reading of that money
        const data = [merchantGroup('Person', 480000, 12), merchantGroup('Target', 190000, 41)];

        // When the series is built for a chart plotting amounts
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            view: CONST.SEARCH.VIEW.BAR,
            getLabel,
            getCurrencyDecimals,
        });

        // Then no point carries one, because the tooltip would print the value it already shows a second time in parentheses
        expect(rows.every((row) => row.point.seriesTotals === undefined)).toBe(true);
    });

    it('leaves the share off every point, since the only share the search reports is of total spend', () => {
        // Given merchant groups the search reported shares of total spend for
        const data = [merchantGroup('Person', 480000, 12, 71.6), merchantGroup('Target', 190000, 41, 28.4)];

        // When the series is built for a pie chart plotting counts
        const {rows} = buildChartSeries({
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            data,
            metric: CONST.SEARCH.CHART_METRIC.COUNT,
            view: CONST.SEARCH.VIEW.PIE,
            getLabel,
            getCurrencyDecimals,
        });

        // Then no point carries a share, because quoting a spend share beside a count would read as the count's
        // share, and the donut would size its slices by count while dropping the ones that spent too little to draw
        expect(rows.every((row) => row.point.percentOfTotal === undefined)).toBe(true);
    });
});

describe('getSliceColorsByDataIndex', () => {
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

        // Then the two drawn groups take the first two palette entries, so no color is spent on a slice that isn't drawn
        expect(colors).toEqual([VictoryTheme.colors.getColor(0), undefined, VictoryTheme.colors.getColor(1)]);
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
    const PERIODS = {primary: {start: '2026-01-01', end: '2026-12-31'}, comparison: {start: '2025-01-01', end: '2025-12-31'}};

    /** Builds the model of a chart plotting one period against the one before it. */
    function buildComparison(rows: GroupedItem[], previousRows: GroupedItem[], groupBy: SearchGroupBy) {
        return buildChartSeries({
            data: rows,
            comparison: {data: previousRows, color: themeColors.green200, periods: PERIODS},
            view: CONST.SEARCH.VIEW.BAR,
            groupBy,
            getLabel: CHART_GROUP_BY_CONFIG[groupBy].getLabel,
            getCurrencyDecimals,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
        });
    }

    it('pairs time buckets by their position in their own period, so a gap cannot shift the rest', () => {
        // Given a period with no row for its second quarter
        const rows = [quarterGroup(1, 100000), quarterGroup(3, 300000)];
        const previousRows = [quarterGroup(1, 10000, 2025), quarterGroup(2, 20000, 2025), quarterGroup(3, 30000, 2025)];

        // When the two periods are plotted against each other
        const model = buildComparison(rows, previousRows, CONST.SEARCH.GROUP_BY.QUARTER);

        // Then Q1 meets Q1 and Q3 meets Q3, rather than Q3 sliding onto Q2, and last year's Q2 still shows between them
        expect(model.rows.map((row) => row.point.values)).toEqual([
            {[CHART_SERIES_KEY.PRIMARY]: 1000, [CHART_SERIES_KEY.COMPARISON]: 100},
            {[CHART_SERIES_KEY.COMPARISON]: 200},
            {[CHART_SERIES_KEY.PRIMARY]: 3000, [CHART_SERIES_KEY.COMPARISON]: 300},
        ]);
    });
});

describe('buildChartSeries labels for compared time buckets', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    /** Fields every grouped bucket carries besides its own date */
    const BUCKET_BASE = {count: 1, total: 100000, currency: CONST.CURRENCY.USD, transactions: []};

    function monthGroup(year: number, month: number): TransactionMonthGroupListItemType {
        return {
            ...BUCKET_BASE,
            groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
            year,
            month,
            formattedMonth: `${month}/${year}`,
            shortFormattedMonth: `${month}`,
            sortKey: month,
            keyForList: `month_${year}_${month}`,
        };
    }

    function weekGroup(week: string): TransactionWeekGroupListItemType {
        return {...BUCKET_BASE, groupedBy: CONST.SEARCH.GROUP_BY.WEEK, week, formattedWeek: week, shortFormattedWeek: week, lineChartFormattedWeek: week, keyForList: `week_${week}`};
    }

    function dayGroup(day: string): TransactionDayGroupListItemType {
        return {...BUCKET_BASE, groupedBy: CONST.SEARCH.GROUP_BY.DAY, day, formattedDay: day, shortFormattedDay: day, lineChartFormattedDay: day, keyForList: `day_${day}`};
    }

    /** Builds the labels of a chart plotting the window on screen against the one before it. */
    function buildLabels(rows: GroupedItem[], groupBy: SearchGroupBy, current: {start: string; end: string}, previous: {start: string; end: string}) {
        return buildChartSeries({
            data: rows,
            comparison: {data: [], color: themeColors.green200, periods: {primary: current, comparison: previous}},
            view: CONST.SEARCH.VIEW.BAR,
            groupBy,
            getLabel: CHART_GROUP_BY_CONFIG[groupBy].getLabel,
            getShortLabel: CHART_GROUP_BY_CONFIG[groupBy].getShortLabel,
            getCurrencyDecimals,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
        }).rows.map((row) => [row.point.label, row.point.shortLabel]);
    }

    it('names months without their year, since the same month of each year is compared', () => {
        // Given year to date plotted against the year before
        const labels = buildLabels(
            [monthGroup(2026, 1), monthGroup(2026, 2)],
            CONST.SEARCH.GROUP_BY.MONTH,
            {start: '2026-01-01', end: '2026-10-01'},
            {start: '2025-01-01', end: '2025-10-01'},
        );

        // Then each month is named on its own, which fits both of the bars drawn for it, and shortened on the axis like a lone series
        expect(labels).toEqual([
            ['January', 'Jan'],
            ['February', 'Feb'],
        ]);
    });

    it('numbers weeks from the start of the window, since their dates differ from month to month', () => {
        // Given September 2026, whose first week starts on Sunday August 30 and second on September 6
        const labels = buildLabels(
            [weekGroup('2026-08-30'), weekGroup('2026-09-06')],
            CONST.SEARCH.GROUP_BY.WEEK,
            {start: '2026-09-01', end: '2026-09-30'},
            {start: '2026-08-01', end: '2026-08-31'},
        );

        // Then the weeks are numbered by their position, which August's weeks share although their dates differ
        expect(labels).toEqual([
            ['Week 1', 'Week 1'],
            ['Week 2', 'Week 2'],
        ]);
    });

    it('names a lone bucket by its unit alone', () => {
        // Given September plotted against August, so a month name would only fit one of the two bars
        const labels = buildLabels([monthGroup(2026, 9)], CONST.SEARCH.GROUP_BY.MONTH, {start: '2026-09-01', end: '2026-09-30'}, {start: '2026-08-01', end: '2026-08-31'});

        // Then it is just "Month", since with nothing beside it a position tells the user nothing
        expect(labels).toEqual([['Month', 'Month']]);
    });

    /** Builds the plotted values of a chart comparing the window on screen against the one before it, which had no expenses. */
    function buildValues(rows: GroupedItem[], groupBy: SearchGroupBy, periods: ChartComparisonPeriods) {
        return buildChartSeries({
            data: rows,
            comparison: {data: [], color: themeColors.green200, periods},
            view: CONST.SEARCH.VIEW.LINE,
            groupBy,
            getLabel: CHART_GROUP_BY_CONFIG[groupBy].getLabel,
            getCurrencyDecimals,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
        }).rows.map((row) => row.point.values);
    }

    it('plots nothing for the compared period where it has no matching day, unlike a day with no expenses', () => {
        // Given October plotted by day against September, which has no 31st
        const values = buildValues([dayGroup('2026-10-30'), dayGroup('2026-10-31')], CONST.SEARCH.GROUP_BY.DAY, {
            primary: {start: '2026-10-01', end: '2026-10-31'},
            comparison: {start: '2026-09-01', end: '2026-09-30'},
            monthsApart: 1,
        });

        // Then October 30 is compared with an empty September 30, and October 31 with nothing
        expect(values).toEqual([{[CHART_SERIES_KEY.PRIMARY]: 1000, [CHART_SERIES_KEY.COMPARISON]: 0}, {[CHART_SERIES_KEY.PRIMARY]: 1000}]);
    });

    it('pairs the days of a custom range by their position, since its compared range is the same number of days before it', () => {
        // Given October as a custom range, compared with the 31 days before it, which spent only on their first day, August 31
        const {rows} = buildChartSeries({
            data: [dayGroup('2026-10-01')],
            comparison: {
                data: [{...dayGroup('2026-08-31'), total: 50000}],
                color: themeColors.green200,
                periods: {primary: {start: '2026-10-01', end: '2026-10-31'}, comparison: {start: '2026-08-31', end: '2026-09-30'}},
            },
            view: CONST.SEARCH.VIEW.LINE,
            groupBy: CONST.SEARCH.GROUP_BY.DAY,
            getLabel: CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.DAY].getLabel,
            getCurrencyDecimals,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
        });

        // Then October 1 is compared with August 31, the first day of each range, rather than with September 1
        expect(rows.at(0)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 1000, [CHART_SERIES_KEY.COMPARISON]: 500});
    });

    /** Builds a chart plotting the window on screen by day against the one before it. */
    function buildDays(days: string[], comparedDays: string[], periods: ChartComparisonPeriods) {
        return buildChartSeries({
            data: days.map(dayGroup),
            comparison: {data: comparedDays.map(dayGroup), color: themeColors.green200, periods},
            view: CONST.SEARCH.VIEW.LINE,
            groupBy: CONST.SEARCH.GROUP_BY.DAY,
            getLabel: CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.DAY].getLabel,
            getCurrencyDecimals,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
        }).rows;
    }

    it('adds the compared days the current period has no day for after its own days', () => {
        // Given February plotted by day against January, whose 29th to 31st have no February day to pair with
        const rows = buildDays(['2026-02-27', '2026-02-28'], ['2026-01-27', '2026-01-28', '2026-01-29', '2026-01-30', '2026-01-31'], {
            primary: {start: '2026-02-01', end: '2026-02-28'},
            comparison: {start: '2026-01-01', end: '2026-01-31'},
            monthsApart: 1,
        });

        // Then January's last three days follow February's, carrying only January's spend, named like the days beside them, and with no group to open
        expect(rows.map((row) => row.point.label)).toEqual(['27th', '28th', '29th', '30th', '31st']);
        expect(rows.slice(2).map((row) => row.point.values)).toEqual([{[CHART_SERIES_KEY.COMPARISON]: 1000}, {[CHART_SERIES_KEY.COMPARISON]: 1000}, {[CHART_SERIES_KEY.COMPARISON]: 1000}]);
        expect(rows.at(2)?.point.seriesLabels).toEqual({[CHART_SERIES_KEY.COMPARISON]: 'January 2026'});
        expect(rows.at(2)?.item).toBeUndefined();
    });

    it('places a compared day the current period has no day for between the days around it', () => {
        // Given 2029 so far plotted by day against 2028, whose February 29 has no 2029 day to pair with
        const rows = buildDays(['2029-02-28', '2029-03-01'], ['2028-02-28', '2028-02-29', '2028-03-01'], {
            primary: {start: '2029-01-01', end: '2029-03-01'},
            comparison: {start: '2028-01-01', end: '2028-03-01'},
            monthsApart: 12,
        });

        // Then February 29 sits between February 28 and March 1, so the compared line keeps its date order
        expect(rows.map((row) => row.point.label)).toEqual(['Feb 28', 'Feb 29', 'Mar 1']);
        expect(rows.at(1)?.point.values).toEqual({[CHART_SERIES_KEY.COMPARISON]: 1000});
    });

    it('numbers a compared month the current period has no month for when the months beside it are numbered', () => {
        // Given March and April as a custom range, compared by position with the 61 days before it, which touch December, January and February
        const {rows} = buildChartSeries({
            data: [monthGroup(2026, 3), monthGroup(2026, 4)],
            comparison: {
                data: [monthGroup(2025, 12), monthGroup(2026, 1), monthGroup(2026, 2)],
                color: themeColors.green200,
                periods: {primary: {start: '2026-03-01', end: '2026-04-30'}, comparison: {start: '2025-12-30', end: '2026-02-28'}},
            },
            view: CONST.SEARCH.VIEW.LINE,
            groupBy: CONST.SEARCH.GROUP_BY.MONTH,
            getLabel: CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.MONTH].getLabel,
            getCurrencyDecimals,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
        });

        // Then February, which no current month pairs with, is numbered like the months before it rather than named "February"
        expect(rows.map((row) => row.point.label)).toEqual(['Month 1', 'Month 2', 'Month 3']);
    });

    /** Builds the dates the tooltip shows for each period at every point. */
    function buildSeriesLabels(rows: GroupedItem[], groupBy: SearchGroupBy, current: {start: string; end: string}, previous: {start: string; end: string}) {
        return buildChartSeries({
            data: rows,
            comparison: {data: [], color: themeColors.green200, periods: {primary: current, comparison: previous}},
            view: CONST.SEARCH.VIEW.LINE,
            groupBy,
            getLabel: CHART_GROUP_BY_CONFIG[groupBy].getLabel,
            getCurrencyDecimals,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
        }).rows.map((row) => row.point.seriesLabels);
    }

    it('gives each period the dates of its own bucket, cut to the period', () => {
        // Given September plotted by week against August, whose first weeks both start before the month
        const labels = buildSeriesLabels([weekGroup('2026-08-30')], CONST.SEARCH.GROUP_BY.WEEK, {start: '2026-09-01', end: '2026-09-30'}, {start: '2026-08-01', end: '2026-08-31'});

        // Then the tooltip names the days each period actually adds up, rather than the period names
        expect(labels).toEqual([{[CHART_SERIES_KEY.PRIMARY]: 'Sep 1 - Sep 5, 2026', [CHART_SERIES_KEY.COMPARISON]: 'Aug 1, 2026'}]);
    });

    it("names each period's row by its year when the same month of two years is compared", () => {
        // Given April of this year to date plotted against April of the year before
        const labels = buildSeriesLabels([monthGroup(2026, 4)], CONST.SEARCH.GROUP_BY.MONTH, {start: '2026-01-01', end: '2026-10-20'}, {start: '2025-01-01', end: '2025-10-20'});

        // Then each row is named by the year, since the month they share already titles the tooltip
        expect(labels).toEqual([{[CHART_SERIES_KEY.PRIMARY]: '2026', [CHART_SERIES_KEY.COMPARISON]: '2025'}]);
    });

    it("names each period's row by its own date when paired days share no name", () => {
        // Given October as a custom range, whose first day is paired with August 31, the first of the 31 days before it
        const labels = buildSeriesLabels([dayGroup('2026-10-01')], CONST.SEARCH.GROUP_BY.DAY, {start: '2026-10-01', end: '2026-10-31'}, {start: '2026-08-31', end: '2026-09-30'});

        // Then each row is named by its full date, since "1st" and "31st" name only one of the two days
        expect(labels).toEqual([{[CHART_SERIES_KEY.PRIMARY]: 'Oct 1, 2026', [CHART_SERIES_KEY.COMPARISON]: 'Aug 31, 2026'}]);
    });

    it('says "so far" on the current period of a bucket still collecting expenses, keeping the bucket name', () => {
        // Given October plotted by day against September, while October 8 is still in progress
        const model = buildChartSeries({
            data: [dayGroup('2026-10-08')],
            comparison: {
                data: [],
                color: themeColors.green200,
                periods: {primary: {start: '2026-10-01', end: '2026-10-31'}, comparison: {start: '2026-09-01', end: '2026-09-30'}},
            },
            view: CONST.SEARCH.VIEW.LINE,
            groupBy: CONST.SEARCH.GROUP_BY.DAY,
            getLabel: CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.DAY].getLabel,
            getCurrencyDecimals,
            translate: translateLocal,
            dateFnsLocale: undefined,
            colorScheme: CONST.COLOR_SCHEME.LIGHT,
            getInProgressLabel: () => 'Oct 8 so far',
        });
        const october8 = model.rows.at(0)?.point;

        // Then only October's row is marked, since September 8 is over, and the axis keeps naming the day while each
        // row names only the month the day belongs to
        expect(october8?.label).toBe('8th');
        expect(october8?.seriesLabels).toEqual({[CHART_SERIES_KEY.PRIMARY]: 'October 2026 so far', [CHART_SERIES_KEY.COMPARISON]: 'September 2026'});
        expect(october8?.isInProgress).toBe(true);
    });
});
