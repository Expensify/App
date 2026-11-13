import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import getPrimaryValue from '@components/Charts/utils/getPrimaryValue';
import VictoryTheme from '@components/Charts/VictoryTheme';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import {isShareWorthDrawing} from '@libs/PercentageUtils';
import StringUtils from '@libs/StringUtils';

import type {ColorScheme} from '@styles/index';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

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
type ChartComparedRows = {
    /** The compared rows, paired with the chart's own rows by key, or time buckets by where they sit in their period when `periods` is set */
    data: GroupedItem[];

    /** Color of the compared line. Compared bars take a shade of their own bar's color instead. */
    color: string;

    /** Set when the rows are another period's */
    periods?: ChartComparisonPeriods;
};

/** The average group value of each metric, drawn as a horizontal line in the chart's own metric. An amount is in the same units and currency as a group's total. */
type ChartAverage = Partial<Record<SearchChartMetric, number>>;

/** What the chart is compared against, drawn as a second series */
type ChartComparison = ChartComparedRows | ChartAverage;

/** Returns whether the chart is compared against an average rather than other rows */
function isChartAverage(comparison: ChartComparison | undefined): comparison is ChartAverage {
    return !!comparison && !('data' in comparison);
}

/** Tooltip label of the average for each group-by */
const AVERAGE_LABEL_KEYS: Partial<Record<SearchGroupBy, TranslationPaths>> = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.compare.dailyAverage',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.compare.weeklyAverage',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.compare.monthlyAverage',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.compare.quarterlyAverage',
    [CONST.SEARCH.GROUP_BY.YEAR]: 'insightsPage.compare.yearlyAverage',
    [CONST.SEARCH.GROUP_BY.FROM]: 'insightsPage.compare.allSpenderAverage',
    [CONST.SEARCH.GROUP_BY.MERCHANT]: 'insightsPage.compare.allMerchantAverage',
    [CONST.SEARCH.GROUP_BY.CATEGORY]: 'insightsPage.compare.allCategoryAverage',
    [CONST.SEARCH.GROUP_BY.VIOLATION]: 'insightsPage.compare.allViolationAverage',
};

/** Returns the label naming the average a chart grouped by `groupBy` is compared against */
function getAverageLabelKey(groupBy: SearchGroupBy): TranslationPaths {
    return AVERAGE_LABEL_KEYS[groupBy] ?? 'insightsPage.compare.average';
}

type BuildChartSeriesParams = {
    /** Grouped search results, in the order the search returned them */
    data: GroupedItem[];

    /** What the chart is compared against, drawn as a second series */
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

    /** Returns whether a group's period starts after today with no expenses of its own, which a running total's count no longer shows */
    isEmptyLaterPeriod?: (item: GroupedItem) => boolean;

    /** Returns whether a compared group has expenses of its own, which a running total's count no longer shows. Reads the group's count by default. */
    hasComparedExpenses?: (item: GroupedItem) => boolean;

    /** Formats labels shared by paired time buckets, and the name of an average */
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
    isEmptyLaterPeriod,
    hasComparedExpenses = (item) => !!item.count,
    translate,
    dateFnsLocale,
    colorScheme,
}: BuildChartSeriesParams): SearchChartModel {
    const {getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const isCountMetric = metric === CONST.SEARCH.CHART_METRIC.COUNT;
    const average = isChartAverage(comparison) ? comparison : undefined;
    const comparedRows = comparison && !isChartAverage(comparison) ? comparison : undefined;
    const periods = comparedRows?.periods;
    const getValue = (item: GroupedItem) => (isCountMetric ? item.count : convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD)));
    // A group a search reports no spend for has no money to name, so the value stands on its own.
    const getTotal = (item: GroupedItem) => (item.total === undefined ? undefined : formatTotal?.(item.total, item.currency));
    // A time bucket's counterpart covers other dates, so compared time buckets are keyed by start date. Other groups match by their own key.
    const comparedByKey = new Map(comparedRows?.data.map((item) => [(periods && getDateRange?.(item)?.start) ?? item.keyForList, item]));
    // The average amount is in the same currency as the rows
    const averageCurrency = data.at(0)?.currency;
    const averageOfMetric = average?.[metric];
    const averageAmount = average?.[CONST.SEARCH.CHART_METRIC.AMOUNT];
    // Like getValue, a count is plotted as-is and an amount is converted to frontend units like the rows
    const averageValue =
        isCountMetric || averageOfMetric === undefined ? averageOfMetric : convertToFrontendAmountAsInteger(averageOfMetric, getCurrencyDecimals(averageCurrency ?? CONST.CURRENCY.USD));
    // A count chart names the spend behind its average in the tooltip, like each group's total
    const averageTotal = isCountMetric && averageAmount !== undefined ? formatTotal?.(averageAmount, averageCurrency) : undefined;

    /** Builds the compared group a search leaves out for having no expenses, so its value, share and spend all read as zero */
    const buildEmptyGroup = (item: GroupedItem): GroupedItem => ({...item, count: 0, total: 0, percentOfTotal: 0});

    /** Returns a group's compared value, share and total, plus its bucket labels when it is compared against another period, or nothing when the chart isn't compared */
    const getCompared = (item: GroupedItem) => {
        if (averageValue !== undefined) {
            return {value: averageValue, percentOfTotal: undefined, total: averageTotal};
        }
        if (!comparedRows) {
            return undefined;
        }

        const bucketRange = getDateRange?.(item);
        if (periods && isTimeGroupBy(groupBy) && bucketRange) {
            const counterpartRange = getCounterpartBucketRange(bucketRange, periods, groupBy);
            const comparedItem = counterpartRange && comparedByKey.get(counterpartRange.start);
            const compared = comparedItem ?? (counterpartRange && buildEmptyGroup(item));
            return {
                value: compared && getValue(compared),
                percentOfTotal: compared?.percentOfTotal,
                total: compared && getTotal(compared),
                hasExpenses: !!comparedItem && hasComparedExpenses(comparedItem),
                bucketLabels: getComparedBucketLabels(bucketRange, counterpartRange, periods, groupBy, translate, dateFnsLocale),
                counterpartStart: counterpartRange?.start,
                sortDate: bucketRange.start,
            };
        }

        // No compared match for a time bucket means its counterpart doesn't exist, but for any other group it means the group had no spend.
        const compared = comparedByKey.get(item.keyForList) ?? (getDateRange ? undefined : buildEmptyGroup(item));
        return {value: compared && getValue(compared), percentOfTotal: compared?.percentOfTotal, total: compared && getTotal(compared)};
    };

    const pairedRows = data.map((item) => {
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const isInProgress = inProgressLabel !== undefined;
        const isLater = !!isLaterPeriod?.(item);
        const compared = getCompared(item);
        const bucketLabels = compared?.bucketLabels;
        const primarySeriesLabel = bucketLabels?.seriesLabels.primary;

        const point: ChartDataPoint = {
            label: bucketLabels?.label ?? inProgressLabel ?? label,
            shortLabel: bucketLabels?.shortLabel ?? (isInProgress ? (shortLabel ?? label) : shortLabel),
            values: {
                [CHART_SERIES_KEY.PRIMARY]: getValue(item),
                ...(compared?.value !== undefined && {[CHART_SERIES_KEY.COMPARISON]: compared.value}),
            },
            percentOfTotal: item.percentOfTotal,
            // A chart plotting counts writes the count out as its value, so the point carries nothing for the tooltip to repeat.
            count: isCountMetric ? undefined : item.count,
            ...(bucketLabels && {
                seriesLabels: {
                    [CHART_SERIES_KEY.PRIMARY]: isInProgress && primarySeriesLabel ? translate('search.periodSoFar', {period: primarySeriesLabel}) : primarySeriesLabel,
                    [CHART_SERIES_KEY.COMPARISON]: bucketLabels.seriesLabels.comparison,
                },
            }),
            ...(compared && {seriesPercentOfTotal: {[CHART_SERIES_KEY.PRIMARY]: item.percentOfTotal, [CHART_SERIES_KEY.COMPARISON]: compared.percentOfTotal}}),
            ...(formatTotal && {seriesTotals: {[CHART_SERIES_KEY.PRIMARY]: getTotal(item), ...(compared && {[CHART_SERIES_KEY.COMPARISON]: compared.total})}}),
            isInProgress: isInProgress || isLater,
        };

        return {
            row: {point, item},
            isEmptyLaterPeriod: !!isEmptyLaterPeriod?.(item),
            hasComparedExpenses: !!compared?.hasExpenses,
            counterpartStart: compared?.counterpartStart,
            sortDate: compared?.sortDate ?? '',
        };
    });

    /** Builds a point for a compared bucket no current bucket pairs with, like January 31 against February, which only the compared line reaches */
    const buildUnpairedRow = (comparedItem: GroupedItem, range: ChartBucketRange, comparisonPeriods: ChartComparisonPeriods, timeGroupBy: TimeGroupBy) => {
        const bucketLabels = getUnpairedBucketLabels(range, comparisonPeriods, timeGroupBy, translate, dateFnsLocale);
        const point: ChartDataPoint = {
            label: bucketLabels.label,
            shortLabel: bucketLabels.shortLabel,
            values: {[CHART_SERIES_KEY.COMPARISON]: getValue(comparedItem)},
            seriesLabels: {[CHART_SERIES_KEY.COMPARISON]: bucketLabels.seriesLabel},
            seriesPercentOfTotal: {[CHART_SERIES_KEY.COMPARISON]: comparedItem.percentOfTotal},
            ...(formatTotal && {seriesTotals: {[CHART_SERIES_KEY.COMPARISON]: getTotal(comparedItem)}}),
            isInProgress: false,
        };
        const row: SearchChartDataRow = {point};
        return {row, isEmptyLaterPeriod: false, hasComparedExpenses: hasComparedExpenses(comparedItem), sortDate: getPositionInPrimaryPeriod(range, comparisonPeriods, timeGroupBy)};
    };

    const pairedStarts = new Set(pairedRows.map((pairedRow) => pairedRow.counterpartStart));
    const unpairedRows =
        comparedRows && periods && isTimeGroupBy(groupBy)
            ? comparedRows.data.flatMap((comparedItem) => {
                  const range = getDateRange?.(comparedItem);
                  return range && !pairedStarts.has(range.start) ? buildUnpairedRow(comparedItem, range, periods, groupBy) : [];
              })
            : [];

    // Sorted by where each bucket sits in the current period. Stable, so a current bucket stays ahead of a compared one sharing its date.
    const sortedRows = [...pairedRows, ...unpairedRows].sort((first, second) => {
        if (first.sortDate === second.sortDate) {
            return 0;
        }
        return first.sortDate < second.sortDate ? -1 : 1;
    });

    // Ends the current line at today, or at the last future expense, instead of drawing $0 through periods that haven't come yet.
    const lastCurrentIndex = sortedRows.findLastIndex((sortedRow) => !!sortedRow.row.item && !sortedRow.isEmptyLaterPeriod);
    const plottedRows = sortedRows.map(({row, isEmptyLaterPeriod: isEmpty}, index) =>
        index > lastCurrentIndex && isEmpty ? {...row, point: {...row.point, values: {...row.point.values, [CHART_SERIES_KEY.PRIMARY]: undefined}}} : row,
    );
    // The chart goes on through the compared period's last expense
    const lastPlottedIndex = sortedRows.findLastIndex((sortedRow, index) => index <= lastCurrentIndex || sortedRow.hasComparedExpenses);
    const rows = plottedRows.slice(0, lastPlottedIndex + 1);

    const pieColors = view === CONST.SEARCH.VIEW.PIE ? getSliceColorsByDataIndex(rows.map((row) => row.point)) : undefined;
    const primarySeries: ChartSeries = {key: CHART_SERIES_KEY.PRIMARY, label: periods && formatDates(periods.primary, dateFnsLocale)};
    const comparisonSeries: ChartSeries | undefined =
        averageValue !== undefined
            ? {key: CHART_SERIES_KEY.COMPARISON, label: translate(getAverageLabelKey(groupBy)), isAverage: true}
            : comparedRows && {key: CHART_SERIES_KEY.COMPARISON, color: comparedRows.color, label: periods && formatDates(periods.comparison, dateFnsLocale)};

    return {
        series: comparisonSeries ? [primarySeries, comparisonSeries] : [primarySeries],
        rows: rows.map((row, index) => {
            if (pieColors) {
                return {...row, point: {...row.point, color: pieColors.at(index)}};
            }
            if (view !== CONST.SEARCH.VIEW.BAR) {
                return row;
            }

            const color = VictoryTheme.colors.getColor(index);
            const seriesColors = {
                [CHART_SERIES_KEY.PRIMARY]: color,
                [CHART_SERIES_KEY.COMPARISON]: comparedRows ? VictoryTheme.colors.getComparisonColor(color, colorScheme) : undefined,
            };
            return {...row, point: {...row.point, color, seriesColors}};
        }),
    };
}

export {buildChartSeries, getAverageLabelKey, getSliceColorsByDataIndex, isChartAverage, CHART_SERIES_KEY};
export type {ChartAverage, ChartComparison, SearchChartModel};
