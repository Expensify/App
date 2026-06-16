import {Skia, Text as SkText} from '@shopify/react-native-skia';
import type {Color, SkFont} from '@shopify/react-native-skia';
import React from 'react';
import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computeTextAnchorPosition from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeTextAnchorPosition';
import {getLocalizedVictoryChartLabelText} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/localizeVictoryChartLabelText';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

type VictoryChartLabelsProps = LabelItem & {
    timezone?: SelectedTimezone;
};

type ProcessedLine = {
    lineX: number;
    lineY: number;
    line: string;
    lineFont: SkFont | null;
    lineColor: Color | undefined;
    lineWidth: number;
};

/**
 * Renders floating Skia text labels (from `<victorylabel>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 */
function VictoryChartLabel({x, y, text, color, fontSize, fontWeight, fontFamily, fontStyle, lineHeight, textAnchor = 'start', verticalAnchor = 'middle', timezone}: VictoryChartLabelsProps) {
    const typefaces = useChartTypefaces();
    const displayText = getLocalizedVictoryChartLabelText(text, timezone);
    const processedLines = displayText.split('\n').reduce(
        (acc, line, index) => {
            const lineColor = color?.[index];
            const lineFontSize = fontSize?.[index];
            const lineFontWeight = fontWeight?.[index];
            const lineFontFamily = fontFamily?.[index];
            const lineFontStyle = fontStyle?.[index];
            const lineLineHeight = lineHeight?.[index];
            const typeface = getChartSkiaTypeface(typefaces, {
                fontFamily: lineFontFamily,
                fontStyle: lineFontStyle,
                fontWeight: lineFontWeight,
            });
            const lineFont = typeface && lineFontSize ? Skia.Font(typeface, lineFontSize) : null;
            const fontMetrics = lineFont?.getMetrics();
            const lineWidth = lineFont?.getGlyphWidths(lineFont.getGlyphIDs(line)).reduce((totalWidth, width) => totalWidth + width, 0) ?? 0;
            const customLineHeight = lineLineHeight ? lineLineHeight * (lineFontSize ?? 0) : 0;
            const metricsLineHeight = fontMetrics ? -fontMetrics.ascent + fontMetrics.descent + fontMetrics.leading : 0;
            const lineX = x;
            const lineY = acc.y - (fontMetrics?.ascent ?? 0);
            acc.y += customLineHeight || metricsLineHeight;

            acc.lines.push({
                lineX,
                lineY,
                line,
                lineFont,
                lineColor,
                lineWidth,
            });
            return acc;
        },
        {lines: [] as ProcessedLine[], y},
    );
    return processedLines.lines.map(({lineX, lineY, line, lineFont, lineColor, lineWidth}) => {
        return (
            <SkText
                key={`text-${lineX}-${lineY}`}
                x={computeTextAnchorPosition(lineX, lineWidth, textAnchor)}
                y={computeTextAnchorPosition(lineY, processedLines.y - y, verticalAnchor)}
                text={line}
                font={lineFont}
                color={lineColor}
            />
        );
    });
}

export default VictoryChartLabel;
