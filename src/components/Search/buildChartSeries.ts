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

import type {ChartComparisonPeriods, ChartPeriod} from './comparisonBuckets';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import {formatDates, getComparedBucketLabels, getCounterpartBucketRange} from './comparisonBuckets';

const CHART_SERIES_KEY = {
    PRIMARY: 'primary',
    COMPARISON: 'comparison',
} as const;

/** Rows drawn as a second series against the primary one */
type ChartComparison = {
    /** The compared rows, paired with the chart's own rows by key, or by position in their period when `periods` is set */
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

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;

    /** Formats labels shared by paired time buckets */
    translate: LocaleContextProps['translate'];

    /** Locale the names of compared periods are formatted in */
    dateFnsLocale: LocaleContextProps['dateFnsLocale'];

    /** Returns the label of a group whose period hasn't ended yet, or undefined for a finished one */
    getInProgressLabel?: (item: GroupedItem) => string | undefined;

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
    translate,
    dateFnsLocale,
    getInProgressLabel,
    colorScheme,
}: BuildChartSeriesParams): SearchChartModel {
    const {bucketUnit, getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const periods = bucketUnit && getDateRange ? comparison?.periods : undefined;
    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));
    // A time bucket's counterpart covers other dates, so compared time buckets are keyed by start date. Other groups match by their own key.
    const comparedByKey = new Map(comparison?.data.map((item) => [(periods && getDateRange?.(item)?.start) ?? item.keyForList, item]));

    /** Returns a group's compared value and share, plus its bucket labels when it is compared against another period */
    const getCompared = (item: GroupedItem) => {
        const bucketRange = periods && getDateRange?.(item);
        if (periods && bucketUnit && bucketRange) {
            const counterpartRange = getCounterpartBucketRange(bucketRange, periods, bucketUnit);
            const comparedItem = counterpartRange && comparedByKey.get(counterpartRange.start);
            return {
                // A bucket with no counterpart plots nothing for the comparison, unlike one with no expenses, which plots 0.
                value: counterpartRange && (comparedItem ? getAmount(comparedItem) : 0),
                percentOfTotal: comparedItem?.percentOfTotal,
                bucketLabels: getComparedBucketLabels(bucketRange, counterpartRange, periods, bucketUnit, translate, dateFnsLocale),
            };
        }

        const comparedItem = comparedByKey.get(item.keyForList);
        // No compared match for a time bucket means its counterpart doesn't exist, but for any other group it means the group had no spend.
        const missingValue = getDateRange ? undefined : 0;
        return {value: comparedItem ? getAmount(comparedItem) : missingValue, percentOfTotal: comparedItem?.percentOfTotal};
    };

    const rows = data.map((item) => {
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const isInProgress = inProgressLabel !== undefined;
        const compared = comparison ? getCompared(item) : undefined;
        const bucketLabels = compared?.bucketLabels;
        const primaryDates = bucketLabels?.seriesLabels.primary;

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
                    [CHART_SERIES_KEY.PRIMARY]: isInProgress && primaryDates ? translate('search.periodSoFar', {period: primaryDates}) : primaryDates,
                    [CHART_SERIES_KEY.COMPARISON]: bucketLabels.seriesLabels.comparison,
                },
            }),
            ...(compared && {seriesPercentOfTotal: {[CHART_SERIES_KEY.PRIMARY]: item.percentOfTotal, [CHART_SERIES_KEY.COMPARISON]: compared.percentOfTotal}}),
            ...(isInProgress && {isInProgress}),
        };

        return {point, item};
    });

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
export type {ChartComparison, ChartComparisonPeriods, ChartPeriod, SearchChartModel};
