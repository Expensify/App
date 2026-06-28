import {Circle, Skia, Text as SkText} from '@shopify/react-native-skia';
import type {Color, SkFont} from '@shopify/react-native-skia';
import React, {Fragment} from 'react';
import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';
import type {LegendItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getSkiaLineMetrics from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getSkiaLineMetrics';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import useTheme from '@hooks/useTheme';

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
    const theme = useTheme();
    const processedEntries = entries.reduce(
        (acc, {text, color, fontSize, fontWeight, fontFamily, fontStyle, symbolColor, symbolSize}) => {
            const typeface = getChartSkiaTypeface(typefaces, {fontFamily, fontStyle, fontWeight});
            const font = typeface && fontSize ? Skia.Font(typeface, fontSize) : null;
            const {ascent, descent, lineHeight} = getSkiaLineMetrics(font);
            const rowCenterY = y + lineHeight / 2;
            const symbolX = acc.x;
            const symbolY = rowCenterY;
            acc.x += (symbolSize ?? 0) + (symbolSpacer ?? 0);
            const textX = acc.x;
            const textY = rowCenterY + (ascent - descent) / 2;
            acc.x += (font?.getGlyphWidths(font.getGlyphIDs(text)).reduce((totalWidth, width) => totalWidth + width, 0) ?? 0) + (gutter ?? 0);
            const resolvedColor = resolveChartThemeColor(color, theme);

            acc.entries.push({
                symbolX,
                symbolY,
                symbolSize,
                symbolColor,
                textX,
                textY,
                text,
                font,
                color: resolvedColor,
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
