import type {PartialProcessNodeResult, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import {
    parseAttributeAsNumber,
    parseAttributeAsNumberArray,
    parseAttributeAsString,
    parseAttributeAsStringArray,
} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseRawAxisStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawAxisStyle';

import type {SkTypeface} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';

import {Skia} from '@shopify/react-native-skia';

/**
 * Parse axis config from a `<victoryaxis>` node.
 * Dependent axes become yAxis entries; independent axes become the xAxis.
 */
function parseVictoryAxisNode(tnode: TNode, typeface: SkTypeface | null, rootProcessedResult: ProcessNodeResult | null): PartialProcessNodeResult {
    const isHorizontal = rootProcessedResult?.isHorizontal;
    const isDependentAxis = 'dependentaxis' in tnode.attributes && tnode.attributes.dependentaxis !== 'false';
    const orientation = parseAttributeAsString(tnode.attributes.orientation);
    const tickCount = parseAttributeAsNumber(tnode.attributes.tickcount);
    const rawTickValues = parseAttributeAsNumberArray(tnode.attributes.tickvalues);
    const rawTickFormat = parseAttributeAsStringArray(tnode.attributes.tickformat);
    const tickFormat = Array.isArray(rawTickFormat) ? rawTickFormat : undefined;
    const hasExplicitTickValues = Array.isArray(rawTickValues) && rawTickValues.length > 0;
    const isCategoryAxis = !isDependentAxis;
    let tickValues: number[] | undefined;
    if (hasExplicitTickValues) {
        tickValues = rawTickValues;
    } else if (isCategoryAxis) {
        const categoryCount = tickFormat?.length ?? 0;
        tickValues = isHorizontal ? tickFormat?.map((_, index) => categoryCount - 1 - index) : tickFormat?.map((_, index) => index);
    }
    const resolvedTickCount = tickCount ?? (isHorizontal && isCategoryAxis && tickValues?.length ? tickValues.length : 0);

    const formatLabel = (label: string | number) => {
        if (!tickFormat) {
            return String(label);
        }

        const numericLabel = Number(label);
        if (tickValues) {
            const index = tickValues.indexOf(numericLabel);
            if (index >= 0) {
                return tickFormat.at(index) ?? String(label);
            }
        }

        if (Number.isInteger(numericLabel) && numericLabel >= 0 && numericLabel < tickFormat.length) {
            return tickFormat.at(numericLabel) ?? String(label);
        }

        return String(label);
    };
    const style = parseRawAxisStyle(tnode.attributes.style);
    const lineColor = style?.grid?.stroke;
    // 0 width intentionally avoids drawing grid lines, preserving VictoryChart compatibility
    const lineWidth = style?.grid?.strokeWidth !== undefined ? Number(style.grid.strokeWidth) : 0;
    const labelColor = style?.tickLabels?.fill !== undefined ? String(style.tickLabels.fill) : undefined;
    const labelOffset = style?.tickLabels?.padding !== undefined ? Number(style.tickLabels.padding) : undefined;
    const fontSize = style?.tickLabels?.fontSize !== undefined ? Number(style.tickLabels.fontSize) : undefined;
    const font = typeface && fontSize ? Skia.Font(typeface, fontSize) : null;

    if (isDependentAxis) {
        return isHorizontal
            ? {
                  xAxis: {
                      tickCount: resolvedTickCount,
                      tickValues,
                      formatXLabel: formatLabel,
                      axisSide: orientation === 'right' ? 'top' : 'bottom',
                      lineColor,
                      lineWidth,
                      labelColor,
                      labelOffset,
                      font,
                  },
              }
            : {
                  yAxis: [
                      {
                          tickCount: resolvedTickCount,
                          tickValues,
                          formatYLabel: formatLabel,
                          axisSide: orientation === 'right' ? 'right' : 'left',
                          lineColor,
                          lineWidth,
                          labelColor,
                          labelOffset,
                          font,
                      },
                  ],
              };
    }
    return isHorizontal
        ? {
              yAxis: [
                  {
                      tickCount: resolvedTickCount,
                      tickValues,
                      formatYLabel: formatLabel,
                      axisSide: orientation === 'top' ? 'right' : 'left',
                      lineColor,
                      lineWidth,
                      labelColor,
                      labelOffset,
                      font,
                  },
              ],
          }
        : {
              xAxis: {
                  tickCount: resolvedTickCount,
                  tickValues,
                  formatXLabel: formatLabel,
                  axisSide: orientation === 'top' ? 'top' : 'bottom',
                  lineColor,
                  lineWidth,
                  labelColor,
                  labelOffset,
                  font,
              },
          };
}

export default parseVictoryAxisNode;
