import type {PartialProcessNodeResult, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getFontGlyphWidth from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getFontGlyphWidth';
import {
    parseAttributeAsNumber,
    parseAttributeAsNumberArray,
    parseAttributeAsString,
    parseAttributeAsStringArray,
} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseRawAxisStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawAxisStyle';

import type {SkFont, SkTypeface} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';

import {Skia} from '@shopify/react-native-skia';

/**
 * The widest rendered label on a left-side y-axis, plus its offset from the axis line —
 * i.e. how much horizontal space the axis actually needs for its labels. Used to shrink
 * the chart's `padding.left` when the configured value is more than the content needs.
 */
function computeLeftAxisLabelSpace(axisSide: 'left' | 'right', labels: Array<string | number> | undefined, font: SkFont | null, labelOffset: number | undefined): number | undefined {
    if (axisSide !== 'left' || !font || !labels?.length) {
        return undefined;
    }
    const maxLabelWidth = Math.max(...labels.map((label) => getFontGlyphWidth(String(label), font)));
    return maxLabelWidth + (labelOffset ?? 0);
}

/**
 * Parse axis config from a `<victoryaxis>` node.
 * Dependent axes become yAxis entries; independent axes become the xAxis.
 */
function parseVictoryAxisNode(tnode: TNode, typeface: SkTypeface | null, rootProcessedResult: ProcessNodeResult | null): PartialProcessNodeResult {
    const isHorizontal = rootProcessedResult?.isHorizontal;
    const isDependentAxis = 'dependentaxis' in tnode.attributes && tnode.attributes.dependentaxis !== 'false';
    const orientation = parseAttributeAsString(tnode.attributes.orientation);
    const tickCount = parseAttributeAsNumber(tnode.attributes.tickcount) ?? 0;
    const rawTickValues = parseAttributeAsNumberArray(tnode.attributes.tickvalues);
    const tickValues = Array.isArray(rawTickValues) ? rawTickValues : undefined;
    const rawTickFormat = parseAttributeAsStringArray(tnode.attributes.tickformat);
    const tickFormat = Array.isArray(rawTickFormat) ? rawTickFormat : undefined;
    const formatLabel = (label: string | number) => tickFormat?.[tickValues?.indexOf(Number(label)) ?? -1] ?? String(label);
    const style = parseRawAxisStyle(tnode.attributes.style);
    const lineColor = style?.grid?.stroke;
    // 0 width intentionally avoids drawing grid lines, preserving VictoryChart compatibility
    const lineWidth = style?.grid?.strokeWidth !== undefined ? Number(style.grid.strokeWidth) : 0;
    const labelColor = style?.tickLabels?.fill !== undefined ? String(style.tickLabels.fill) : undefined;
    const labelOffset = style?.tickLabels?.padding !== undefined ? Number(style.tickLabels.padding) : undefined;
    const fontSize = style?.tickLabels?.fontSize !== undefined ? Number(style.tickLabels.fontSize) : undefined;
    const font = typeface && fontSize ? Skia.Font(typeface, fontSize) : null;
    const labelsForMeasurement = tickFormat ?? tickValues;

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
    if (isHorizontal) {
        const axisSide = orientation === 'top' ? 'right' : 'left';
        return {
            yAxis: [
                {
                    tickCount,
                    tickValues,
                    formatYLabel: formatLabel,
                    axisSide,
                    lineColor,
                    lineWidth,
                    labelColor,
                    labelOffset,
                    font,
                },
            ],
            leftAxisLabelSpace: computeLeftAxisLabelSpace(axisSide, labelsForMeasurement, font, labelOffset),
        };
    }
    return {
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
