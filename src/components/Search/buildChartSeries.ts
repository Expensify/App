import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import getPrimaryValue from '@components/Charts/utils/getPrimaryValue';
import VictoryTheme from '@components/Charts/VictoryTheme';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import {isShareWorthDrawing} from '@libs/PercentageUtils';
import StringUtils from '@libs/StringUtils';

import type {ColorScheme} from '@styles/index';

import CONST from '@src/CONST';

import type {NonEmptyTuple} from 'type-fest';

import type {ChartBucketRange} from './chartGroupByConfig';
import type {ChartComparisonPeriods, TimeGroupBy} from './comparisonBuckets';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchChartMetric, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import {formatDates, getComparedBucketLabels, getCounterpartBucketRange, getPositionInPrimaryPeriod, getUnpairedBucketLabels, isTimeGroupBy} from './comparisonBuckets';

const CHART_SERIES_KEY = {
    PRIMARY: 'primary',
    COMPARISON: 'comparison',
} as const;

/** Rows drawn as a second series against the primary one */
type ChartComparison = {
    /** The compared rows, paired with the chart's own rows by key, or time buckets by where they sit in their period when `periods` is set */
    data: GroupedItem[];

    /** Names the series in the tooltip, like "Average". Left out, each row names the dates it covers. */
    label?: string;

    /** Color of the compared line. Compared bars take a shade of their own bar's color instead. */
    color: string;

    /** Set when the rows are another period's */
    periods?: ChartComparisonPeriods;
};

type BuildChartSeriesParams = {
    /** Grouped search results, in the order the search returned them */
    data: GroupedItem[];

    /** Rows the chart is compared against, drawn as a second series */
    comparison?: ChartComparison;

    /** Decides how compared groups pair up, and whether a missing one plots as nothing or as 0 */
    groupBy: SearchGroupBy;

    /** The chart type the rows are plotted on, which decides how groups are colored */
    view: ChartView;

    /** What each group contributes to the chart: the money it totals, or how many expenses it holds. Defaults to the amount. */
    metric?: SearchChartMetric;

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;

    /** Writes out the money a group totals, named beside a plotted value that isn't money. Left out by charts plotting the amount itself. */
    formatTotal?: (total: number, currency: string | undefined) => string;

    /** Returns the label of the group whose period includes today, or undefined for any other group */
    getInProgressLabel?: (item: GroupedItem) => string | undefined;

    /** Returns whether a group's period starts after today, as it does for future-dated expenses */
    isLaterPeriod?: (item: GroupedItem) => boolean;

    /** Formats labels shared by paired time buckets */
    translate: LocaleContextProps['translate'];

    /** Locale the names of compared periods are formatted in */
    dateFnsLocale: LocaleContextProps['dateFnsLocale'];

    /** Decides the shade of a compared bar */
    colorScheme: ColorScheme;
};

type SearchChartModel = {
    /** Metadata for each plotted series, primary first */
    series: NonEmptyTuple<ChartSeries>;

    /** One row per plotted group, holding the point the chart draws and the row its values came from */
    rows: SearchChartDataRow[];
};

/** Pie colors follow the slice ranking rather than the array order. Groups the donut leaves out get no color. */
function getSliceColorsByDataIndex(data: ChartDataPoint[]): Array<string | undefined> {
    const colors: Array<string | undefined> = Array.from({length: data.length});

    const ranked = data
        .map((point, index) => ({absTotal: Math.abs(getPrimaryValue(point, CHART_SERIES_KEY.PRIMARY)), percentOfTotal: point.percentOfTotal, index}))
        .filter((entry) => isShareWorthDrawing(entry.percentOfTotal))
        .sort((a, b) => b.absTotal - a.absTotal);

    for (const [rank, entry] of ranked.entries()) {
        colors[entry.index] = VictoryTheme.colors.getColor(rank);
    }

    return colors;
}

/** This is the single place group totals and counts are turned into plotted values. */
function buildChartSeries({
    data,
    comparison,
    groupBy,
    view,
    metric = CONST.SEARCH.CHART_METRIC.AMOUNT,
    getLabel,
    getShortLabel,
    getCurrencyDecimals,
    formatTotal,
    getInProgressLabel,
    isLaterPeriod,
    translate,
    dateFnsLocale,
    colorScheme,
}: BuildChartSeriesParams): SearchChartModel {
    const {getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const periods = comparison?.periods;
    const isCountMetric = metric === CONST.SEARCH.CHART_METRIC.COUNT;
    const getValue = (item: GroupedItem) => (isCountMetric ? item.count : convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD)));
    // The share the search reports is a share of total spend, so it says nothing about a group's place among the counts.
    const getShare = (item: GroupedItem) => (isCountMetric ? undefined : item.percentOfTotal);
    // A group a search reports no spend for has no money to name, so the value stands on its own.
    const getTotal = (item: GroupedItem) => (item.total === undefined ? undefined : formatTotal?.(item.total, item.currency));
    // A time bucket's counterpart covers other dates, so compared time buckets are keyed by start date. Other groups match by their own key.
    const comparedByKey = new Map(comparison?.data.map((item) => [(periods && getDateRange?.(item)?.start) ?? item.keyForList, item]));

    /** Returns a group's compared value, share and total, plus its bucket labels when it is compared against another period */
    const getCompared = (item: GroupedItem) => {
        const bucketRange = getDateRange?.(item);
        if (periods && isTimeGroupBy(groupBy) && bucketRange) {
            const counterpartRange = getCounterpartBucketRange(bucketRange, periods, groupBy);
            const comparedItem = counterpartRange && comparedByKey.get(counterpartRange.start);
            return {
                value: counterpartRange && (comparedItem ? getValue(comparedItem) : 0),
                percentOfTotal: comparedItem && getShare(comparedItem),
                total: comparedItem && getTotal(comparedItem),
                bucketLabels: getComparedBucketLabels(bucketRange, counterpartRange, periods, groupBy, translate, dateFnsLocale),
                counterpartStart: counterpartRange?.start,
                sortDate: bucketRange.start,
            };
        }

        const comparedItem = comparedByKey.get(item.keyForList);
        // No compared match for a time bucket means its counterpart doesn't exist, but for any other group it means the group had no spend.
        const missingValue = getDateRange ? undefined : 0;
        return {value: comparedItem ? getValue(comparedItem) : missingValue, percentOfTotal: comparedItem && getShare(comparedItem), total: comparedItem && getTotal(comparedItem)};
    };

    const pairedRows = data.map((item) => {
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const isInProgress = inProgressLabel !== undefined;
        const compared = comparison ? getCompared(item) : undefined;
        const bucketLabels = compared?.bucketLabels;
        const primarySeriesLabel = bucketLabels?.seriesLabels.primary;

        const point: ChartDataPoint = {
            label: bucketLabels?.label ?? inProgressLabel ?? label,
            shortLabel: bucketLabels?.shortLabel ?? (isInProgress ? (shortLabel ?? label) : shortLabel),
            values: {
                [CHART_SERIES_KEY.PRIMARY]: getValue(item),
                ...(compared?.value !== undefined && {[CHART_SERIES_KEY.COMPARISON]: compared.value}),
            },
            percentOfTotal: getShare(item),
            // A chart plotting counts writes the count out as its value, so the point carries nothing for the tooltip to repeat.
            count: isCountMetric ? undefined : item.count,
            ...(bucketLabels && {
                seriesLabels: {
                    [CHART_SERIES_KEY.PRIMARY]: isInProgress && primarySeriesLabel ? translate('search.periodSoFar', {period: primarySeriesLabel}) : primarySeriesLabel,
                    [CHART_SERIES_KEY.COMPARISON]: bucketLabels.seriesLabels.comparison,
                },
            }),
            ...(compared && {seriesPercentOfTotal: {[CHART_SERIES_KEY.PRIMARY]: getShare(item), [CHART_SERIES_KEY.COMPARISON]: compared.percentOfTotal}}),
            ...(formatTotal && {seriesTotals: {[CHART_SERIES_KEY.PRIMARY]: getTotal(item), ...(compared && {[CHART_SERIES_KEY.COMPARISON]: compared.total})}}),
            isInProgress: isInProgress || !!isLaterPeriod?.(item),
        };

        return {row: {point, item}, counterpartStart: compared?.counterpartStart, sortDate: compared?.sortDate ?? ''};
    });

    /** Builds a point for a compared bucket no current bucket pairs with, like January 31 against February, which only the compared line reaches */
    const buildUnpairedRow = (comparedItem: GroupedItem, range: ChartBucketRange, comparisonPeriods: ChartComparisonPeriods, timeGroupBy: TimeGroupBy) => {
        const bucketLabels = getUnpairedBucketLabels(range, comparisonPeriods, timeGroupBy, translate, dateFnsLocale);
        const point: ChartDataPoint = {
            label: bucketLabels.label,
            shortLabel: bucketLabels.shortLabel,
            values: {[CHART_SERIES_KEY.COMPARISON]: getValue(comparedItem)},
            seriesLabels: {[CHART_SERIES_KEY.COMPARISON]: bucketLabels.seriesLabel},
            seriesPercentOfTotal: {[CHART_SERIES_KEY.COMPARISON]: getShare(comparedItem)},
            ...(formatTotal && {seriesTotals: {[CHART_SERIES_KEY.COMPARISON]: getTotal(comparedItem)}}),
            isInProgress: false,
        };
        return {row: {point}, sortDate: getPositionInPrimaryPeriod(range, comparisonPeriods, timeGroupBy)};
    };

    const pairedStarts = new Set(pairedRows.map((pairedRow) => pairedRow.counterpartStart));
    const unpairedRows =
        comparison && periods && isTimeGroupBy(groupBy)
            ? comparison.data.flatMap((comparedItem) => {
                  const range = getDateRange?.(comparedItem);
                  return range && !pairedStarts.has(range.start) ? buildUnpairedRow(comparedItem, range, periods, groupBy) : [];
              })
            : [];

    // Sorted by where each bucket sits in the current period. Stable, so a current bucket stays ahead of a compared one sharing its date.
    const rows: SearchChartDataRow[] = [...pairedRows, ...unpairedRows]
        .sort((first, second) => {
            if (first.sortDate === second.sortDate) {
                return 0;
            }
            return first.sortDate < second.sortDate ? -1 : 1;
        })
        .map(({row}) => row);

    const pieColors = view === CONST.SEARCH.VIEW.PIE ? getSliceColorsByDataIndex(rows.map((row) => row.point)) : undefined;

    return {
        series: [
            {key: CHART_SERIES_KEY.PRIMARY, label: comparison?.periods && formatDates(comparison.periods.primary, dateFnsLocale)},
            ...(comparison
                ? [
                      {
                          key: CHART_SERIES_KEY.COMPARISON,
                          color: comparison.color,
                          label: comparison.label ?? (comparison.periods && formatDates(comparison.periods.comparison, dateFnsLocale)),
                      },
                  ]
                : []),
        ],
        rows: rows.map((row, index) => {
            if (pieColors) {
                return {...row, point: {...row.point, color: pieColors.at(index)}};
            }
            if (view !== CONST.SEARCH.VIEW.BAR) {
                return row;
            }

            const color = VictoryTheme.colors.getColor(index);
            const seriesColors = {[CHART_SERIES_KEY.PRIMARY]: color, ...(!!comparison && {[CHART_SERIES_KEY.COMPARISON]: VictoryTheme.colors.getComparisonColor(color, colorScheme)})};
            return {...row, point: {...row.point, color, seriesColors}};
        }),
    };
}

export {buildChartSeries, getSliceColorsByDataIndex, CHART_SERIES_KEY};
export type {ChartComparison, SearchChartModel};
