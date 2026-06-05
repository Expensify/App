import {Skia} from '@shopify/react-native-skia';
import type {SkTypeface} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';
import type {PartialProcessNodeResult, ProcessNodeResult, RawAxisStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse axis config from a `<victoryaxis>` node.
 * Dependent axes become yAxis entries; independent axes become the xAxis.
 */
function parseVictoryAxisNode(tnode: TNode, typeface: SkTypeface | null, rootProcessedResult: ProcessNodeResult | null): PartialProcessNodeResult {
    const isHorizontal = rootProcessedResult?.isHorizontal;
    const isDependentAxis = 'dependentaxis' in tnode.attributes && tnode.attributes.dependentaxis !== 'false';
    const orientation = parseAttribute<string>(tnode.attributes.orientation);
    const tickCount = parseAttribute<number>(tnode.attributes.tickcount) ?? 0;
    const rawTickValues = parseAttribute<number[]>(tnode.attributes.tickvalues);
    const tickValues = Array.isArray(rawTickValues) ? rawTickValues : undefined;
    const rawTickFormat = parseAttribute<string[]>(tnode.attributes.tickformat);
    const tickFormat = Array.isArray(rawTickFormat) ? rawTickFormat : undefined;
    const formatLabel = (label: string | number) => tickFormat?.[tickValues?.indexOf(Number(label)) ?? -1] ?? String(label);
    const style = parseAttribute<RawAxisStyle>(tnode.attributes.style);
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
                      tickCount,
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
                          tickCount,
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
                      tickCount,
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
                  tickCount,
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
