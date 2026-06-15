import {Circle, Skia, Text as SkText} from '@shopify/react-native-skia';
import type {Color, SkFont} from '@shopify/react-native-skia';
import React, {Fragment} from 'react';
import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';
import type {LegendItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type VictoryChartLegendProps = LegendItem & {
    chartWidth?: number;
};

type ProcessedEntry = {
    symbolX: number;
    symbolY: number;
    symbolSize: number | undefined;
    symbolColor: Color | undefined;
    textX: number;
    textY: number;
    text: string;
    font: SkFont | null;
    color: Color | undefined;
};

/**
 * Renders Skia legend symbols and labels (from `<victorylegend>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 */
function VictoryChartLegend({x, y, entries, gutter, symbolSpacer, chartWidth}: VictoryChartLegendProps) {
    const typefaces = useChartTypefaces();
    const processedEntries = entries.reduce(
        (acc, {text, color, fontSize, fontWeight, fontFamily, fontStyle, symbolColor, symbolSize}) => {
            const typeface = getChartSkiaTypeface(typefaces, {fontFamily, fontStyle, fontWeight});
            const font = typeface && fontSize ? Skia.Font(typeface, fontSize) : null;
            const fontMetrics = font?.getMetrics();
            const lineHeight = fontMetrics ? fontMetrics.ascent + fontMetrics.descent + fontMetrics.leading : 0;
            const symbolX = acc.x;
            const symbolY = y;
            acc.x += (symbolSize ?? 0) + (symbolSpacer ?? 0);
            const textX = acc.x;
            const textY = y - lineHeight / 2;
            acc.x += (font?.getGlyphWidths(font.getGlyphIDs(text)).reduce((totalWidth, width) => totalWidth + width, 0) ?? 0) + (gutter ?? 0);

            acc.entries.push({
                symbolX,
                symbolY,
                symbolSize,
                symbolColor,
                textX,
                textY,
                text,
                font,
                color,
            });
            return acc;
        },
        {entries: [] as ProcessedEntry[], x},
    );

    if (chartWidth) {
        const legendTotalWidth = processedEntries.x - x - (gutter ?? 0);
        const centeredX = (chartWidth - legendTotalWidth) / 2;
        const offset = centeredX - x;
        for (const entry of processedEntries.entries) {
            entry.symbolX += offset;
            entry.textX += offset;
        }
    }

    return processedEntries.entries.map(({symbolX, symbolY, symbolSize, symbolColor, textX, textY, text, font, color}) => {
        return (
            <Fragment key={`legend-${textX}-${textY}`}>
                {!!symbolSize && (
                    <Circle
                        cx={symbolX}
                        cy={symbolY}
                        r={symbolSize}
                        color={symbolColor}
                    />
                )}
                <SkText
                    x={textX}
                    y={textY}
                    text={text}
                    font={font}
                    color={color}
                />
            </Fragment>
        );
    });
}

export default VictoryChartLegend;
