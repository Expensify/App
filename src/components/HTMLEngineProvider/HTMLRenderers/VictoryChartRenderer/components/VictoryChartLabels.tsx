import {Skia, Text as SkText} from '@shopify/react-native-skia';
import React from 'react';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type VictoryChartLabelsProps = {
    labelItems: LabelItem[];
};

/**
 * Renders floating Skia text labels (from `<victorylabel>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 */
function VictoryChartLabels({labelItems}: VictoryChartLabelsProps) {
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
    return (
        <>
            {labelItems.map(({x, y: startY, text, color, fontSize, fontWeight, lineHeight}) => {
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
                    y += finalLineHeight;
                    const lineY = y;
                    return (
                        <SkText
                            key={`text-${x}-${y}`}
                            x={x}
                            y={lineY}
                            text={line}
                            font={font}
                            color={lineColor}
                        />
                    );
                });
            })}
        </>
    );
}

VictoryChartLabels.displayName = 'VictoryChartLabels';

export default VictoryChartLabels;
