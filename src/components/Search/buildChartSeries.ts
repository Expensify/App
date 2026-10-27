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
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

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

/** One value every group is compared against, drawn as a horizontal line */
type ChartAverage = {
    /** The average, in the same units and currency as a group's total */
    total: number;
};

/** What the chart is compared against, drawn as a second series */
type ChartComparison = ChartComparedRows | ChartAverage;

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
};

type BuildChartSeriesParams = {
    /** Grouped search results, in the order the search returned them */
    data: GroupedItem[];

    /** What the chart is compared against, drawn as a second series */
    comparison?: ChartComparison;

    /** Decides how compared groups pair up, and whether a missing one plots as nothing or as 0 */
    groupBy: SearchGroupBy;

    /** The chart type the rows are plotted on, which decides how groups are colored */
    view: ChartView;

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;

    /** Returns the label of the group whose period includes today, or undefined for any other group */
    getInProgressLabel?: (item: GroupedItem) => string | undefined;

    /** Returns whether a group's period starts after today, as it does for future-dated expenses */
    isLaterPeriod?: (item: GroupedItem) => boolean;

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

/** This is the single place group totals are turned into plotted values. */
function buildChartSeries({
    data,
    comparison,
    groupBy,
    view,
    getLabel,
    getShortLabel,
    getCurrencyDecimals,
    getInProgressLabel,
    isLaterPeriod,
    translate,
    dateFnsLocale,
    colorScheme,
}: BuildChartSeriesParams): SearchChartModel {
    const {getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const average = comparison && 'total' in comparison ? comparison : undefined;
    const comparedRows = comparison && 'data' in comparison ? comparison : undefined;
    const periods = comparedRows?.periods;
    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));
    // A time bucket's counterpart covers other dates, so compared time buckets are keyed by start date. Other groups match by their own key.
    const comparedByKey = new Map(comparedRows?.data.map((item) => [(periods && getDateRange?.(item)?.start) ?? item.keyForList, item]));
    // The average is in the same currency as the rows
    const averageValue = average && convertToFrontendAmountAsInteger(average.total, getCurrencyDecimals(data.at(0)?.currency ?? CONST.CURRENCY.USD));

    /** Returns a group's compared value and share, plus its bucket labels when it is compared against another period, or nothing when the chart isn't compared */
    const getCompared = (item: GroupedItem) => {
        if (averageValue !== undefined) {
            return {value: averageValue, percentOfTotal: undefined};
        }
        if (!comparedRows) {
            return undefined;
        }

        const bucketRange = getDateRange?.(item);
        if (periods && isTimeGroupBy(groupBy) && bucketRange) {
            const counterpartRange = getCounterpartBucketRange(bucketRange, periods, groupBy);
            const comparedItem = counterpartRange && comparedByKey.get(counterpartRange.start);
            return {
                value: counterpartRange && (comparedItem ? getAmount(comparedItem) : 0),
                percentOfTotal: comparedItem?.percentOfTotal,
                bucketLabels: getComparedBucketLabels(bucketRange, counterpartRange, periods, groupBy, translate, dateFnsLocale),
                counterpartStart: counterpartRange?.start,
                sortDate: bucketRange.start,
            };
        }

        const comparedItem = comparedByKey.get(item.keyForList);
        // No compared match for a time bucket means its counterpart doesn't exist, but for any other group it means the group had no spend.
        const missingValue = getDateRange ? undefined : 0;
        return {value: comparedItem ? getAmount(comparedItem) : missingValue, percentOfTotal: comparedItem?.percentOfTotal};
    };

    const pairedRows = data.map((item) => {
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const isInProgress = inProgressLabel !== undefined;
        const compared = getCompared(item);
        const bucketLabels = compared?.bucketLabels;
        const primarySeriesLabel = bucketLabels?.seriesLabels.primary;

        const point: ChartDataPoint = {
            label: bucketLabels?.label ?? inProgressLabel ?? label,
            shortLabel: bucketLabels?.shortLabel ?? (isInProgress ? (shortLabel ?? label) : shortLabel),
            values: {
                [CHART_SERIES_KEY.PRIMARY]: getAmount(item),
                ...(compared?.value !== undefined && {[CHART_SERIES_KEY.COMPARISON]: compared.value}),
            },
            percentOfTotal: item.percentOfTotal,
            count: item.count,
            ...(bucketLabels && {
                seriesLabels: {
                    [CHART_SERIES_KEY.PRIMARY]: isInProgress && primarySeriesLabel ? translate('search.periodSoFar', {period: primarySeriesLabel}) : primarySeriesLabel,
                    [CHART_SERIES_KEY.COMPARISON]: bucketLabels.seriesLabels.comparison,
                },
            }),
            ...(compared && {seriesPercentOfTotal: {[CHART_SERIES_KEY.PRIMARY]: item.percentOfTotal, [CHART_SERIES_KEY.COMPARISON]: compared.percentOfTotal}}),
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
            values: {[CHART_SERIES_KEY.COMPARISON]: getAmount(comparedItem)},
            seriesLabels: {[CHART_SERIES_KEY.COMPARISON]: bucketLabels.seriesLabel},
            seriesPercentOfTotal: {[CHART_SERIES_KEY.COMPARISON]: comparedItem.percentOfTotal},
            isInProgress: false,
        };
        return {row: {point}, sortDate: getPositionInPrimaryPeriod(range, comparisonPeriods, timeGroupBy)};
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
    const rows: SearchChartDataRow[] = [...pairedRows, ...unpairedRows]
        .sort((first, second) => {
            if (first.sortDate === second.sortDate) {
                return 0;
            }
            return first.sortDate < second.sortDate ? -1 : 1;
        })
        .map(({row}) => row);

    const pieColors = view === CONST.SEARCH.VIEW.PIE ? getSliceColorsByDataIndex(rows.map((row) => row.point)) : undefined;
    const primarySeries: ChartSeries = {key: CHART_SERIES_KEY.PRIMARY, label: periods && formatDates(periods.primary, dateFnsLocale)};
    const comparisonSeries: ChartSeries | undefined = average
        ? {key: CHART_SERIES_KEY.COMPARISON, label: translate(AVERAGE_LABEL_KEYS[groupBy] ?? 'insightsPage.compare.average'), isAverage: true}
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

export {buildChartSeries, getSliceColorsByDataIndex, CHART_SERIES_KEY};
export type {ChartComparison, SearchChartModel};
