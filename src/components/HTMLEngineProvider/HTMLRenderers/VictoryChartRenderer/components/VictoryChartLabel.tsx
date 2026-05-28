import {Skia, Text as SkText} from '@shopify/react-native-skia';
import React from 'react';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computeTextHorizontalPosition from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeTextHorizontalPosition';

type VictoryChartLabelsProps = LabelItem;

/**
 * Renders floating Skia text labels (from `<victorylabel>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 */
function VictoryChartLabel({x, y: startY, text, color, fontSize, fontWeight, lineHeight, textAnchor = 'start', verticalAnchor = 'start'}: VictoryChartLabelsProps) {
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
    let y = startY;
    return text.split('\n').map((line, index) => {
        const lineColor = color?.[index];
        const lineFontSize = fontSize?.[index];
        const lineFontWeight = fontWeight?.[index];
        const lineLineHeight = lineHeight?.[index];
        const typeface = lineFontWeight === 'bold' ? boldTypeface : regularTypeface;
        const font = typeface ? Skia.Font(typeface, lineFontSize) : null;
        const fontMetrics = font?.getMetrics();
        const lineWidth = font?.getGlyphWidths(font.getGlyphIDs(line)).reduce((acc, width) => acc + width, 0) ?? 0;
        const baseLineHeight = fontMetrics ? Math.abs(fontMetrics.ascent) + Math.abs(fontMetrics.descent) + Math.abs(fontMetrics.leading) : 0;
        const finalLineHeight = lineLineHeight ? lineLineHeight * (lineFontSize ?? 0) : baseLineHeight;
        const lineY = y - (fontMetrics?.ascent ?? 0);
        y += finalLineHeight;
        return (
            <SkText
                key={`text-${x}-${y}`}
                x={computeTextHorizontalPosition(x, lineWidth, textAnchor)}
                y={computeTextHorizontalPosition(lineY, finalLineHeight, verticalAnchor)}
                text={line}
                font={font}
                color={lineColor}
            />
        );
    });
}

VictoryChartLabel.displayName = 'VictoryChartLabel';

export default VictoryChartLabel;
