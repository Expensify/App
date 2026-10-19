import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import getPrimaryValue from '@components/Charts/utils/getPrimaryValue';
import VictoryTheme from '@components/Charts/VictoryTheme';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import {isShareWorthDrawing} from '@libs/PercentageUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

import type {NonEmptyTuple} from 'type-fest';

import type {ChartView, GroupedItem, SearchChartDataRow} from './types';

const CHART_SERIES_KEY = {
    PRIMARY: 'primary',
    COMPARISON: 'comparison',
} as const;

/** A second series drawn against the primary one */
type ChartComparison = {
    /** The compared rows, each paired with the plotted group stored under the same key */
    data: GroupedItem[];

    /** Names the series in the tooltip, like "Average" */
    label: string;

    color: string;
};

type BuildChartSeriesParams = {
    /** Grouped search results, in the order the search returned them */
    data: GroupedItem[];

    /** Rows the chart is compared against, drawn as a second series */
    comparison?: ChartComparison;

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
function buildChartSeries({data, comparison, view, getLabel, getShortLabel, getCurrencyDecimals, getInProgressLabel}: BuildChartSeriesParams): SearchChartModel {
    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));
    const comparedByKey = new Map(comparison?.data.map((item) => [item.keyForList, item]));
    const rows = data.map((item) => {
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const comparedItem = comparedByKey.get(item.keyForList);
        const point: ChartDataPoint = {
            label,
            shortLabel,
            values: {
                [CHART_SERIES_KEY.PRIMARY]: getAmount(item),
                ...(comparedItem && {[CHART_SERIES_KEY.COMPARISON]: getAmount(comparedItem)}),
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
        series: [{key: CHART_SERIES_KEY.PRIMARY}, ...(comparison ? [{key: CHART_SERIES_KEY.COMPARISON, color: comparison.color, label: comparison.label}] : [])],
        rows: rows.map((row, index) => {
            let color;
            if (pieColors) {
                color = pieColors.at(index);
            } else if (view === CONST.SEARCH.VIEW.BAR) {
                color = VictoryTheme.colors.getColor(index);
            }

            return {...row, point: {...row.point, color}};
        }),
    };
}

export {buildChartSeries, getSliceColorsByDataIndex, CHART_SERIES_KEY};
export type {ChartComparison, SearchChartModel};
