import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import getPrimaryValue from '@components/Charts/utils/getPrimaryValue';
import VictoryTheme from '@components/Charts/VictoryTheme';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {isShareWorthDrawing} from '@libs/PercentageUtils';
import StringUtils from '@libs/StringUtils';

import type {ColorScheme} from '@styles/index';

import CONST from '@src/CONST';

import type {NonEmptyTuple} from 'type-fest';

import {endOfMonth, endOfQuarter, endOfYear, format, isSameDay, parseISO, startOfMonth, startOfQuarter, startOfYear} from 'date-fns';

import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';

const CHART_SERIES_KEY = {
    PRIMARY: 'primary',
    COMPARISON: 'comparison',
} as const;

/** A period's first and last day */
type ChartPeriod = {start: string; end: string};

/** The two periods being compared */
type ChartComparisonPeriods = {
    primary: ChartPeriod;
    comparison: ChartPeriod;
};

/** Rows drawn as a second series against the primary one */
type ChartComparison = {
    /** The compared rows, each paired with the plotted group stored under the same key */
    data: GroupedItem[];

    /** Names the series in the tooltip, like "Average". Left out, each series names the period it covers. */
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

    /** Decides whether a group missing from the compared rows plots as nothing or as 0 */
    groupBy: SearchGroupBy;

    /** The chart type the rows are plotted on, which decides how groups are colored */
    view: ChartView;

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;

    /** Returns the label of a group whose period hasn't ended yet, or undefined for a finished one */
    getInProgressLabel?: (item: GroupedItem) => string | undefined;

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

/** Names a range of dates, by its calendar name when it spans a whole one, like "October 2026", or else by its dates */
function formatDates({start, end}: ChartPeriod, dateFnsLocale: LocaleContextProps['dateFnsLocale']): string {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const isWholeUnit = (toStart: (date: Date) => Date, toEnd: (date: Date) => Date) => isSameDay(startDate, toStart(startDate)) && isSameDay(endDate, toEnd(startDate));

    if (isSameDay(startDate, endDate)) {
        return format(startDate, 'MMM d, yyyy', {locale: dateFnsLocale});
    }
    if (isWholeUnit(startOfYear, endOfYear)) {
        return format(startDate, 'yyyy', {locale: dateFnsLocale});
    }
    if (isWholeUnit(startOfQuarter, endOfQuarter)) {
        return format(startDate, 'QQQ yyyy', {locale: dateFnsLocale});
    }
    if (isWholeUnit(startOfMonth, endOfMonth)) {
        return format(startDate, 'LLLL yyyy', {locale: dateFnsLocale});
    }
    return DateUtils.getFormattedDateRangeForSearch(start, end, dateFnsLocale);
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
    dateFnsLocale,
    colorScheme,
}: BuildChartSeriesParams): SearchChartModel {
    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));
    const comparedByKey = new Map(comparison?.data.map((item) => [item.keyForList, item]));
    const rows = data.map((item) => {
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const comparedItem = comparedByKey.get(item.keyForList);
        let comparedValue: number | undefined;
        if (comparedItem) {
            comparedValue = getAmount(comparedItem);
        } else if (comparison && !CHART_GROUP_BY_CONFIG[groupBy].getDateRange) {
            // No compared match for a time bucket means its counterpart doesn't exist, but for any other group it means the group had no spend.
            comparedValue = 0;
        }

        const point: ChartDataPoint = {
            label,
            shortLabel,
            values: {
                [CHART_SERIES_KEY.PRIMARY]: getAmount(item),
                ...(comparedValue !== undefined && {[CHART_SERIES_KEY.COMPARISON]: comparedValue}),
            },
            percentOfTotal: item.percentOfTotal,
            count: item.count,
        };
        if (inProgressLabel !== undefined) {
            point.label = inProgressLabel;
            point.shortLabel = shortLabel ?? label;
            point.isInProgress = true;
        }

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
