import {X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {CartesianChartData, CartesianChartProps, ProcessNodeResult, XKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

/**
 * Convert a vertically-oriented parse result into the horizontally-oriented equivalent.
 *
 * Two cases are handled, branching on whether the original x values are numeric:
 *
 * 1. Numeric x (e.g. month offsets `1.13`, `2.13`): straight field swap. Each emitted entry is
 *    `{x: originalValue, [yKey]: originalX}`. The new Y-axis inherits the original X-axis tick
 *    values and formatter directly, so positions are preserved (important for grouped bars at
 *    decimal offsets).
 *
 * 2. String x (e.g. `'Ethan Brooks'`): categories are mapped to integer row indices in order of
 *    first appearance, and the new Y-axis gets synthesized `tickValues` + a `formatYLabel` that
 *    returns the original category name.
 *
 * Multi-series is supported: for each data entry we emit one swapped entry per yKey that has a
 * numeric value, so each `<victorybar>` keeps its own points.
 */
function applyHorizontalTransform(parsed: ProcessNodeResult): ProcessNodeResult {
    const {data, yKeys, xAxis, yAxis, labelItems, legendItems} = parsed;

    const entries = Object.values(data);
    const isNumericX = entries.length > 0 && entries.every((entry) => typeof entry[X_KEY] === 'number');

    // For string x, build the category → index map in order of first appearance so the first
    // category lands at y=0, the second at y=1, etc.
    const categoryOrder: Array<string | number> = [];
    const categoryIndex = new Map<string | number, number>();
    if (!isNumericX) {
        for (const entry of entries) {
            const originalX = entry[X_KEY];
            if (!categoryIndex.has(originalX)) {
                categoryIndex.set(originalX, categoryOrder.length);
                categoryOrder.push(originalX);
            }
        }
    }

    const transformedData: Record<string, CartesianChartData> = {};
    let nextKey = 0;
    for (const entry of entries) {
        const originalX = entry[X_KEY];
        const newYPosition = isNumericX ? (originalX as number) : (categoryIndex.get(originalX) ?? 0);
        for (const yKey of yKeys) {
            const value = entry[yKey];
            if (typeof value !== 'number') {
                continue;
            }
            transformedData[String(nextKey)] = {
                [X_KEY]: value,
                [yKey]: newYPosition,
            } as CartesianChartData;
            nextKey += 1;
        }
    }

    // X-axis labels accept `string | number` (xKey may be either) but yAxis.formatYLabel only
    // takes `number`, so the cast through a wrapper avoids a contravariant assignment error.
    const sourceValueFormatter = yAxis?.at(0)?.formatYLabel;
    const formatXLabelForValues = sourceValueFormatter ? (label: string | number) => sourceValueFormatter(typeof label === 'number' ? label : Number(label)) : undefined;

    // For string-category data, we own the y-axis label mapping ourselves: tickValues are the
    // row indices we generated, formatYLabel returns the original category name. For numeric x,
    // the original xAxis's tick values and formatter pass through unchanged.
    const sourceCategoryFormatter = xAxis?.formatXLabel;
    const newYAxisTickValues = isNumericX ? xAxis?.tickValues : categoryOrder.map((_, i) => i);
    const wrappedNumericFormatter = sourceCategoryFormatter ? (label: number) => sourceCategoryFormatter(label) : undefined;
    const newYAxisFormatLabel = isNumericX ? wrappedNumericFormatter : (label: number) => String(categoryOrder.at(label) ?? '');

    const newXAxis: CartesianChartProps['xAxis'] = yAxis?.at(0)
        ? {
              tickCount: yAxis.at(0)?.tickCount,
              tickValues: yAxis.at(0)?.tickValues,
              formatXLabel: formatXLabelForValues,
              axisSide: yAxis.at(0)?.axisSide === 'right' ? 'top' : 'bottom',
              lineColor: yAxis.at(0)?.lineColor,
              lineWidth: yAxis.at(0)?.lineWidth,
              labelColor: yAxis.at(0)?.labelColor,
              labelOffset: yAxis.at(0)?.labelOffset,
              font: yAxis.at(0)?.font,
          }
        : xAxis;

    const newYAxis: CartesianChartProps['yAxis'] = xAxis
        ? [
              {
                  tickCount: xAxis.tickCount,
                  tickValues: newYAxisTickValues,
                  formatYLabel: newYAxisFormatLabel,
                  axisSide: xAxis.axisSide === 'top' ? 'right' : 'left',
                  lineColor: xAxis.lineColor,
                  lineWidth: xAxis.lineWidth,
                  labelColor: xAxis.labelColor,
                  labelOffset: xAxis.labelOffset,
                  font: xAxis.font,
              },
          ]
        : yAxis;

    return {
        data: transformedData,
        xKey: X_KEY as XKey,
        yKeys,
        xAxis: newXAxis,
        yAxis: newYAxis,
        labelItems,
        legendItems,
    };
}

export default applyHorizontalTransform;
