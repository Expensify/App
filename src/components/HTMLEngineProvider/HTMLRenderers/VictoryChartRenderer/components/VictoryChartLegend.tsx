import {Circle, Skia, Text as SkText} from '@shopify/react-native-skia';
import React, {Fragment} from 'react';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

/**
 * Renders Skia legend symbols and labels (from `<victorylegend>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 */
function VictoryChartLegend() {
    const {legendItems, regularTypeface, boldTypeface} = useVictoryChartContext();
    return (
        <>
            {legendItems.map(({x: startX, y, entries, gutter, symbolSpacer}) => {
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
            })}
        </>
    );
}

VictoryChartLegend.displayName = 'VictoryChartLegend';

export default VictoryChartLegend;
