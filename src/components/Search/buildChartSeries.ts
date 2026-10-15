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
} as const;

type BuildChartSeriesParams = {
    /** Grouped search results, in the order the search returned them */
    data: GroupedItem[];

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
function buildChartSeries({data, view, getLabel, getShortLabel, getCurrencyDecimals, getInProgressLabel, isLaterPeriod}: BuildChartSeriesParams): SearchChartModel {
    const rows = data.map((item) => {
        const decimals = getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD);
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const point: ChartDataPoint = {
            label,
            shortLabel,
            values: {[CHART_SERIES_KEY.PRIMARY]: convertToFrontendAmountAsInteger(item.total ?? 0, decimals)},
            percentOfTotal: item.percentOfTotal,
            count: item.count,
        };
        if (inProgressLabel !== undefined) {
            point.label = inProgressLabel;
            point.shortLabel = shortLabel ?? label;
            point.isInProgress = true;
        } else if (isLaterPeriod?.(item)) {
            point.isInProgress = true;
        }

        return {point, item};
    });

    const pieColors = view === CONST.SEARCH.VIEW.PIE ? getSliceColorsByDataIndex(rows.map((row) => row.point)) : undefined;

    return {
        series: [{key: CHART_SERIES_KEY.PRIMARY}],
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
export type {SearchChartModel};
