/**
 * Formats the tooltip of a stacked bar chart: one section per stack at the active point, listing each segment's value,
 * or naming it unavailable when the point has no value for it.
 */
import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import VictoryTheme from '@components/Charts/VictoryTheme';

import type {TooltipRow} from './formatTooltipComparison';

import {getSeriesStacks} from './stackedBars';

/** One stack's rows, under the name of the period it covers at the point */
type TooltipStack = {
    key: string;

    /** Names the stack's period at the point, like "February 2025". Left out when the chart has a single stack, which the tooltip's title already names. */
    label?: string;

    rows: TooltipRow[];
};

type TooltipStacks = {
    stacks: TooltipStack[];

    /** The average the stacks are compared against, shown after them */
    averageRow?: TooltipRow;
};

/** Returns the tooltip's sections at a point of a stacked chart, or undefined when no series is stacked */
function formatTooltipStacks(dataPoint: ChartDataPoint, series: readonly ChartSeries[], formatValue: (value: number) => string, unavailableLabel: string): TooltipStacks | undefined {
    const seriesStacks = getSeriesStacks(series);
    if (seriesStacks.length === 0) {
        return undefined;
    }

    const unavailableKeys = new Set(dataPoint.unavailableSeriesKeys);
    const stacks = seriesStacks.flatMap((stack): TooltipStack[] => {
        const rows = stack.flatMap(({key, label, color = VictoryTheme.colors.default}): TooltipRow[] => {
            const value = dataPoint.values[key];
            if (value === undefined && !unavailableKeys.has(key)) {
                return [];
            }
            return [
                {
                    key,
                    color,
                    label,
                    value: value === undefined ? unavailableLabel : formatValue(value),
                },
            ];
        });
        const firstKey = stack.at(0)?.key;
        if (rows.length === 0 || !firstKey) {
            return [];
        }
        return [{key: firstKey, label: dataPoint.seriesLabels?.[firstKey], rows}];
    });

    const averageSeries = series.find(({isAverage}) => isAverage);
    const averageValue = averageSeries && dataPoint.values[averageSeries.key];
    const averageRow: TooltipRow | undefined =
        averageSeries && averageValue !== undefined
            ? {
                  key: averageSeries.key,
                  color: VictoryTheme.colors.default,
                  isAverage: true,
                  label: averageSeries.label,
                  value: formatValue(averageValue),
              }
            : undefined;

    return {stacks, averageRow};
}

export default formatTooltipStacks;
export type {TooltipStack, TooltipStacks};
