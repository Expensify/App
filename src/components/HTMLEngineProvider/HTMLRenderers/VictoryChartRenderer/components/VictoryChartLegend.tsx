import {Circle, Skia, Text as SkText} from '@shopify/react-native-skia';
import React, {Fragment} from 'react';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import type {VictoryChartScaleValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartScaleContext';
import type {LegendItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type VictoryChartLegendProps = {
    legendItems: LegendItem[];
    scale: VictoryChartScaleValue;
};

/**
 * Renders Skia legend symbols and labels (from `<victorylegend>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 * Scale must be passed as a prop because Skia's Canvas uses a separate reconciler
 * that does not inherit React context from the outer tree.
 */
function VictoryChartLegend({legendItems, scale}: VictoryChartLegendProps) {
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
    const uniformScale = Math.min(scale.x, scale.y);
    return (
        <>
            {legendItems.map(({x: startX, y, entries, gutter, symbolSpacer}) => {
                const scaledY = y * scale.y;
                const scaledGutter = gutter !== undefined ? gutter * uniformScale : undefined;
                const scaledSymbolSpacer = symbolSpacer !== undefined ? symbolSpacer * uniformScale : undefined;
                let x = startX * scale.x;
                return entries.map(({text, color, fontSize, fontWeight, symbolColor, symbolSize}) => {
                    const scaledFontSize = fontSize !== undefined ? fontSize * uniformScale : undefined;
                    const scaledSymbolSize = symbolSize !== undefined ? symbolSize * uniformScale : undefined;
                    const typeface = fontWeight === 'bold' ? boldTypeface : regularTypeface;
                    const font = typeface ? Skia.Font(typeface, scaledFontSize) : null;
                    const fontMetrics = font?.getMetrics();
                    const lineHeight = fontMetrics ? fontMetrics.ascent + fontMetrics.descent + fontMetrics.leading : 0;
                    const symbolX = x;
                    x += (scaledSymbolSize ?? 0) + (scaledSymbolSpacer ?? 0);
                    const textX = x;
                    x += (font?.getGlyphWidths(font.getGlyphIDs(text)).reduce((acc, width) => acc + width, 0) ?? 0) + (scaledGutter ?? 0);
                    return (
                        <Fragment key={`legend-${x}-${scaledY}`}>
                            {!!scaledSymbolSize && (
                                <Circle
                                    cx={symbolX}
                                    cy={scaledY}
                                    r={scaledSymbolSize}
                                    color={symbolColor}
                                />
                            )}
                            <SkText
                                x={textX}
                                y={scaledY - lineHeight / 2}
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
