import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import VictoryTheme from '@components/Charts/VictoryTheme';

import {formatPercentOfTotal} from '@libs/PercentageUtils';

import type Locale from '@src/types/onyx/Locale';

import type {NonEmptyTuple} from 'type-fest';

import getTooltipNote from './getTooltipNote';

/** One compared series' value at the active point */
type TooltipRow = {
    key: string;

    /** The series' color, shown as a dot before the row */
    color: string;

    /** Names the series, like "Average", or the dates the point covers in its period */
    label?: string;

    value: string;

    /** Shown in parentheses after the value */
    note?: string;
};

/** How the primary series changed against the one it is compared with */
type TooltipChange = {
    /** The difference, without its sign */
    value: string;

    /** The difference relative to the compared value */
    percentage: string;

    isIncrease: boolean;
};

type TooltipComparison = {
    /** One row per series that has a value at the point */
    rows: TooltipRow[];

    change?: TooltipChange;
};

/** Formats how much the primary value rose or fell relative to the compared one, as a percentage */
function formatChangePercentage(primaryValue: number, comparedValue: number, locale: Locale | undefined): string {
    if (comparedValue === 0) {
        return '—';
    }

    const difference = primaryValue - comparedValue;
    return formatPercentOfTotal((Math.abs(difference) / Math.abs(comparedValue)) * 100, difference, locale);
}

/** Formats how much the primary value rose or fell against the compared one. */
function formatChange(primaryValue: number, comparedValue: number, formatAmount: (value: number) => string, locale: Locale | undefined): TooltipChange | undefined {
    if (primaryValue === comparedValue) {
        return undefined;
    }

    const difference = primaryValue - comparedValue;
    return {
        value: formatAmount(Math.abs(difference)),
        percentage: formatChangePercentage(primaryValue, comparedValue, locale),
        isIncrease: difference > 0,
    };
}

/** Formats each series' value at the point and the primary series' change against the second */
function formatTooltipComparison(
    dataPoint: ChartDataPoint,
    series: NonEmptyTuple<ChartSeries>,
    formatAmount: (value: number) => string,
    locale: Locale | undefined,
): TooltipComparison | undefined {
    const [{key: primarySeriesKey}, comparedSeries] = series;
    const primaryValue = dataPoint.values[primarySeriesKey];
    const comparedValue = comparedSeries && dataPoint.values[comparedSeries.key];
    if (!comparedSeries || (primaryValue === undefined && comparedValue === undefined) || (comparedValue === undefined && !dataPoint.seriesLabels)) {
        return undefined;
    }

    const rows = series.flatMap(({key, color = VictoryTheme.colors.default, label}) => {
        const value = dataPoint.values[key];
        if (value === undefined) {
            return [];
        }
        return {
            key,
            color: dataPoint.seriesColors?.[key] ?? color,
            label: dataPoint.seriesLabels?.[key] ?? label,
            value: formatAmount(value),
            note: getTooltipNote(value, dataPoint.seriesPercentOfTotal?.[key], dataPoint.seriesTotals?.[key], locale),
        };
    });

    return {rows, change: primaryValue === undefined || comparedValue === undefined ? undefined : formatChange(primaryValue, comparedValue, formatAmount, locale)};
}

export default formatTooltipComparison;
export {formatChangePercentage};
export type {TooltipChange, TooltipRow};
