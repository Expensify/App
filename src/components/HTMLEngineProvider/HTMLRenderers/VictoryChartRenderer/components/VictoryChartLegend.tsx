import {Circle, Skia, Text as SkText} from '@shopify/react-native-skia';
import React, {Fragment} from 'react';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import type {LegendItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type VictoryChartLegendProps = LegendItem;

/**
 * Renders Skia legend symbols and labels (from `<victorylegend>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 */
function VictoryChartLegend({x: startX, y, entries, gutter, symbolSpacer}: VictoryChartLegendProps) {
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
    let x = startX;
    return entries.map(({text, color, fontSize, fontWeight, symbolColor, symbolSize}) => {
        const typeface = fontWeight === 'bold' ? boldTypeface : regularTypeface;
        const font = typeface ? Skia.Font(typeface, fontSize) : null;
        const fontMetrics = font?.getMetrics();
        const lineHeight = fontMetrics ? fontMetrics.ascent + fontMetrics.descent + fontMetrics.leading : 0;
        const symbolX = x;
        x += (symbolSize ?? 0) + (symbolSpacer ?? 0);
        const textX = x;
        x += (font?.getGlyphWidths(font.getGlyphIDs(text)).reduce((acc, width) => acc + width, 0) ?? 0) + (gutter ?? 0);
        return (
            <Fragment key={`legend-${x}-${y}`}>
                {!!symbolSize && (
                    <Circle
                        cx={symbolX}
                        cy={y}
                        r={symbolSize}
                        color={symbolColor}
                    />
                )}
                <SkText
                    x={textX}
                    y={y - lineHeight / 2}
                    text={text}
                    font={font}
                    color={color}
                />
            </Fragment>
        );
    });
}

VictoryChartLegend.displayName = 'VictoryChartLegend';

export default VictoryChartLegend;
