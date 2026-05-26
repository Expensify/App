import {Line, Skia, Text as SkText} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartTypefaces} from '@components/Charts/types';
import {getChartLabelTypeface} from '@components/Charts/utils/getChartLabelTypeface';
import type {PieChartConfig, PolarChartDatum} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computePieSliceGeometries from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieSliceGeometries';
import type {PieSliceGeometry} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieSliceGeometries';
import getPieLabelIndicatorGeometry from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getPieLabelIndicatorGeometry';

type RenderPieSliceLabelElementsParams = {
    slice: PieSliceGeometry;
    pieConfig: PieChartConfig;
    typefaces: ChartTypefaces;
    sliceIndex: number;
};

const RADIAN = Math.PI / 180;
const DEFAULT_LABEL_COLORS = ['#002E22', '#76847E'];

function renderPieSliceLabelElements({slice, pieConfig, typefaces, sliceIndex}: RenderPieSliceLabelElementsParams): React.ReactElement[] {
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const labelRadius = pieConfig.labelRadius ?? slice.radius * 1.2;
    const labelX = slice.center.x + labelRadius * Math.cos(-midAngle * RADIAN);
    const labelY = slice.center.y + labelRadius * Math.sin(midAngle * RADIAN);
    const isLeftSide = midAngle > 90 && midAngle < 270;
    const textAnchor = isLeftSide ? 'end' : 'start';

    const lines = slice.label.split('\n');
    const lineHeights = pieConfig.labelComponentLineHeights ?? [];
    const lineStyles = pieConfig.labelComponentStyles ?? [];
    const elements: React.ReactElement[] = [];
    const lineMetrics: Array<{width: number; height: number; fontSize: number}> = [];

    for (const [index, line] of lines.entries()) {
        const style = lineStyles.at(index);
        const fontSize = style?.fontSize !== undefined ? Number(style.fontSize) : 11;
        const typeface = getChartLabelTypeface(typefaces, style);
        const font = typeface ? Skia.Font(typeface, fontSize) : null;
        const lineHeightMultiplier = lineHeights.at(index) ?? 1.2;
        const lineHeight = fontSize * lineHeightMultiplier;
        const width = font?.getGlyphWidths(font.getGlyphIDs(line)).reduce((acc, glyphWidth) => acc + glyphWidth, 0) ?? 0;
        lineMetrics.push({width, height: lineHeight, fontSize});
    }

    const totalHeight = lineMetrics.reduce((acc, metric) => acc + metric.height, 0);
    const currentY = labelY - totalHeight / 2;
    const labelIndicator = getPieLabelIndicatorGeometry({
        center: slice.center,
        innerRadius: pieConfig.innerRadius,
        outerRadius: slice.radius,
        labelRadius,
        labelX,
        labelY,
        pieConfig,
    });

    if (labelIndicator) {
        elements.push(
            <Line
                key={`slice-${sliceIndex}-connector`}
                p1={labelIndicator.start}
                p2={labelIndicator.elbow}
                color={pieConfig.labelIndicatorStroke ?? '#E6E1DA'}
                strokeWidth={pieConfig.labelIndicatorStrokeWidth ?? 1}
            />,
        );
    }

    for (const [index, line] of lines.entries()) {
        const style = lineStyles.at(index);
        const fontSize = lineMetrics.at(index)?.fontSize ?? 11;
        const typeface = getChartLabelTypeface(typefaces, style);
        const font = typeface ? Skia.Font(typeface, fontSize) : null;

        if (font) {
            const color = style?.fill ?? DEFAULT_LABEL_COLORS.at(index) ?? DEFAULT_LABEL_COLORS.at(0);
            const lineWidth = lineMetrics.at(index)?.width ?? 0;
            const lineOffset = lineMetrics.slice(0, index).reduce((acc, metric) => acc + metric.height, 0);
            const textX = textAnchor === 'end' ? labelX - lineWidth : labelX;

            elements.push(
                <SkText
                    key={`slice-${sliceIndex}-line-${index}`}
                    x={textX}
                    y={currentY + lineOffset + fontSize}
                    text={line}
                    font={font}
                    color={color}
                />,
            );
        }
    }

    return elements;
}

type RenderAllPieSliceLabelElementsParams = {
    polarData: PolarChartDatum[];
    pieConfig: PieChartConfig;
    canvasWidth: number;
    canvasHeight: number;
    typefaces: ChartTypefaces;
};

/**
 * Renders all external pie slice labels in a Skia overlay canvas.
 */
function renderAllPieSliceLabelElements({polarData, pieConfig, canvasWidth, canvasHeight, typefaces}: RenderAllPieSliceLabelElementsParams): React.ReactElement[] {
    const slices = computePieSliceGeometries(polarData, pieConfig, canvasWidth, canvasHeight);

    return slices.flatMap((slice, sliceIndex) =>
        renderPieSliceLabelElements({
            slice,
            pieConfig,
            typefaces,
            sliceIndex,
        }),
    );
}

export {renderPieSliceLabelElements, renderAllPieSliceLabelElements};
export default renderAllPieSliceLabelElements;
