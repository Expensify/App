import {Group, Skia, Text as SkText, vec} from '@shopify/react-native-skia';
import type {Color, SkFont} from '@shopify/react-native-skia';
import React from 'react';
import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import {rotatedLabelCenterCorrection} from '@components/Charts/utils';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computeTextAnchorPosition from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeTextAnchorPosition';
import getSkiaLineMetrics from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getSkiaLineMetrics';
import {getLocalizedVictoryChartLabelText} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/localizeVictoryChartLabelText';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import useTheme from '@hooks/useTheme';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

type VictoryChartLabelsProps = LabelItem & {
    timezone?: SelectedTimezone;
    barWidth?: number;
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
function VictoryChartLabel({
    x,
    y,
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    fontStyle,
    lineHeight,
    textAnchor = 'start',
    verticalAnchor = 'middle',
    angle = 0,
    timezone,
    barWidth,
}: VictoryChartLabelsProps) {
    const typefaces = useChartTypefaces();
    const theme = useTheme();
    const displayText = getLocalizedVictoryChartLabelText(text, timezone);
    const processedLines = displayText.split('\n').reduce(
        (acc, line, index) => {
            const lineColor = resolveChartThemeColor(color?.[index], theme);
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
            const {ascent, lineHeight: metricsLineHeight} = getSkiaLineMetrics(lineFont);
            const lineWidth = lineFont?.getGlyphWidths(lineFont.getGlyphIDs(line)).reduce((totalWidth, width) => totalWidth + width, 0) ?? 0;
            const customLineHeight = lineLineHeight ? lineLineHeight * (lineFontSize ?? 0) : 0;
            const lineX = x;
            const lineY = acc.y + ascent;
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

    const angleRad = (angle * Math.PI) / 180;

    if (angleRad === 0) {
        return processedLines.lines.map(({lineX, lineY, line, lineFont, lineColor, lineWidth}) => {
            const anchoredX = computeTextAnchorPosition(lineX, lineWidth, textAnchor);
            const anchoredY = computeTextAnchorPosition(lineY, processedLines.y - y, verticalAnchor);

            return (
                <SkText
                    key={`text-${lineX}-${lineY}`}
                    x={anchoredX}
                    y={anchoredY}
                    text={line}
                    font={lineFont}
                    color={lineColor}
                />
            );
        });
    }

    const tickX = x - (textAnchor === 'end' && barWidth !== undefined ? barWidth / 2 : 0);
    const labelY = y;
    const correction = rotatedLabelCenterCorrection(
        getSkiaLineMetrics(processedLines.lines.at(0)?.lineFont ?? null).ascent,
        getSkiaLineMetrics(processedLines.lines.at(0)?.lineFont ?? null).descent,
        angleRad,
    );

    return (
        <Group
            key={`rotated-text-${x}-${y}`}
            origin={vec(tickX, labelY)}
            transform={[{translateX: correction}, {rotate: -angleRad}]}
        >
            {processedLines.lines.map(({lineX, lineY, line, lineFont, lineColor, lineWidth}) => {
                const {ascent} = getSkiaLineMetrics(lineFont);
                const textX = computeTextAnchorPosition(tickX, lineWidth, textAnchor);

                return (
                    <SkText
                        key={`rotated-line-${lineX}-${lineY}-${line}`}
                        x={textX}
                        y={lineY - ascent}
                        text={line}
                        font={lineFont}
                        color={lineColor}
                    />
                );
            })}
        </Group>
    );
}

export default VictoryChartLabel;
