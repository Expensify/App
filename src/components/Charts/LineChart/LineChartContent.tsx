import {Group, Text as SkiaText, useFont, vec} from '@shopify/react-native-skia';
import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds} from 'victory-native';
import {CartesianChart, Line, Scatter} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartHeader from '@components/Charts/components/ChartHeader';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import {CHART_CONTENT_MIN_HEIGHT, CHART_PADDING, X_AXIS_LINE_WIDTH, Y_AXIS_LABEL_OFFSET, Y_AXIS_LINE_WIDTH, Y_AXIS_TICK_COUNT} from '@components/Charts/constants';
import fontSource from '@components/Charts/font';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartInteractions, useChartLabelFormats, useChartLabelLayout, useDynamicYDomain, useTooltipData} from '@components/Charts/hooks';
import type {CartesianChartProps, ChartDataPoint} from '@components/Charts/types';
import {DEFAULT_CHART_COLOR, measureTextWidth, rotatedLabelCenterCorrection} from '@components/Charts/utils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/** Inner dot radius for line chart data points */
const DOT_RADIUS = 6;

/** Extra pixel spacing between the plot boundary and the first/last data point */
const LINE_CHART_DOMAIN_PADDING = 16;

/** Gap between the x-axis line and the top of label glyphs */
const X_AXIS_LABEL_GAP = 2;

type LineChartProps = CartesianChartProps & {
    /** Callback when a data point is pressed */
    onPointPress?: (dataPoint: ChartDataPoint, index: number) => void;
};

function LineChartContent({data, title, titleIcon, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onPointPress}: LineChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const font = useFont(fontSource, variables.iconSizeExtraSmall);
    const [chartWidth, setChartWidth] = useState(0);
    const [chartBoundsInfo, setChartBoundsInfo] = useState({plotAreaWidth: 0, firstTickOffset: 0});

    const yAxisDomain = useDynamicYDomain(data);

    const chartData = useMemo(() => {
        return data.map((point, index) => ({
            x: index,
            y: point.total,
        }));
    }, [data]);

    const handlePointPress = useCallback(
        (index: number) => {
            if (index < 0 || index >= data.length) {
                return;
            }
            const dataPoint = data.at(index);
            if (dataPoint && onPointPress) {
                onPointPress(dataPoint, index);
            }
        },
        [data, onPointPress],
    );

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    }, []);

    const handleChartBoundsChange = useCallback((bounds: ChartBounds) => {
        setChartBoundsInfo({
            plotAreaWidth: bounds.right - bounds.left,
            firstTickOffset: bounds.left + LINE_CHART_DOMAIN_PADDING,
        });
    }, []);

    const {plotAreaWidth, firstTickOffset} = chartBoundsInfo;

    const tickSpacing = useMemo(() => {
        if (plotAreaWidth === 0 || data.length <= 1) {
            return 0;
        }
        return (plotAreaWidth - 2 * LINE_CHART_DOMAIN_PADDING) / (data.length - 1);
    }, [plotAreaWidth, data.length]);

    const {labelRotation, labelSkipInterval, truncatedLabels, xAxisLabelHeight} = useChartLabelLayout({
        data,
        font,
        tickSpacing,
        labelAreaWidth: plotAreaWidth,
        firstTickOffset,
    });

    // Measure label widths for custom positioning in `renderOutside`
    const labelWidths = useMemo(() => {
        if (!font) {
            return [] as number[];
        }
        return truncatedLabels.map((label) => measureTextWidth(label, font));
    }, [font, truncatedLabels]);

    // Convert hook's degree rotation to radians for Skia rendering
    const angleRad = (Math.abs(labelRotation) * Math.PI) / 180;

    const {formatYAxisLabel} = useChartLabelFormats({
        data,
        yAxisUnit,
        yAxisUnitPosition,
    });

    const checkIsOverDot = useCallback((args: HitTestArgs) => {
        'worklet';

        const dx = args.cursorX - args.targetX;
        const dy = args.cursorY - args.targetY;
        return Math.sqrt(dx * dx + dy * dy) <= DOT_RADIUS;
    }, []);

    const {actionsRef, customGestures, activeDataIndex, isTooltipActive, tooltipStyle} = useChartInteractions({
        handlePress: handlePointPress,
        checkIsOver: checkIsOverDot,
    });

    const tooltipData = useTooltipData(activeDataIndex, data, yAxisUnit, yAxisUnitPosition);

    // Victory's built-in x-axis labels center each label under its tick mark,
    // which works for bar charts but clips labels on line charts where data points
    // sit at the edges. We render labels via `renderOutside` with custom positioning.
    const renderCustomXLabels = useCallback(
        (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
            if (!font) {
                return null;
            }

            const fontMetrics = font.getMetrics();
            const ascent = Math.abs(fontMetrics.ascent);
            const descent = Math.abs(fontMetrics.descent);
            const labelY = args.chartBounds.bottom + X_AXIS_LABEL_GAP + font.getSize();

            return truncatedLabels.map((label, i) => {
                if (i % labelSkipInterval !== 0) {
                    return null;
                }

                const tickX = args.xScale(i);
                const labelWidth = labelWidths.at(i) ?? 0;

                if (angleRad === 0) {
                    return (
                        <SkiaText
                            key={`x-label-${label}`}
                            x={tickX - labelWidth}
                            y={labelY}
                            text={label}
                            font={font}
                            color={theme.textSupporting}
                        />
                    );
                }

                const textX = tickX - labelWidth;
                const origin = vec(tickX, labelY);

                // Rotate around the anchor, then translate to correct for ascent/descent
                // asymmetry (ascent > descent shifts the visual center left of the anchor).
                const correction = rotatedLabelCenterCorrection(ascent, descent, angleRad);

                return (
                    <Group
                        key={`x-label-${label}`}
                        origin={origin}
                        transform={[{translateX: correction}, {rotate: -angleRad}]}
                    >
                        <SkiaText
                            x={textX}
                            y={labelY}
                            text={label}
                            font={font}
                            color={theme.textSupporting}
                        />
                    </Group>
                );
            });
        },
        [font, truncatedLabels, labelSkipInterval, labelWidths, angleRad, theme.textSupporting],
    );

    const dynamicChartStyle = useMemo(
        () => ({
            height: CHART_CONTENT_MIN_HEIGHT + (xAxisLabelHeight ?? 0),
        }),
        [xAxisLabelHeight],
    );

    if (isLoading || !font) {
        return (
            <View style={[styles.lineChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <View style={[styles.lineChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8]}>
            <ChartHeader
                title={title}
                titleIcon={titleIcon}
            />
            <View
                style={[styles.lineChartChartContainer, dynamicChartStyle]}
                onLayout={handleLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        padding={{top: CHART_PADDING, left: CHART_PADDING, right: CHART_PADDING, bottom: (xAxisLabelHeight ?? 0) + CHART_PADDING}}
                        yKeys={['y']}
                        domainPadding={LINE_CHART_DOMAIN_PADDING}
                        actionsRef={actionsRef}
                        customGestures={customGestures}
                        onChartBoundsChange={handleChartBoundsChange}
                        renderOutside={renderCustomXLabels}
                        xAxis={{
                            tickCount: data.length,
                            lineWidth: X_AXIS_LINE_WIDTH,
                        }}
                        yAxis={[
                            {
                                font,
                                labelColor: theme.textSupporting,
                                formatYLabel: formatYAxisLabel,
                                tickCount: Y_AXIS_TICK_COUNT,
                                lineWidth: Y_AXIS_LINE_WIDTH,
                                lineColor: theme.border,
                                labelOffset: Y_AXIS_LABEL_OFFSET,
                                domain: yAxisDomain,
                            },
                        ]}
                        frame={{lineWidth: {left: 1, bottom: 1, top: 0, right: 0}, lineColor: theme.border}}
                        data={chartData}
                    >
                        {({points}) => (
                            <>
                                <Line
                                    points={points.y}
                                    color={DEFAULT_CHART_COLOR}
                                    strokeWidth={2}
                                    curveType="linear"
                                />
                                <Scatter
                                    points={points.y}
                                    radius={DOT_RADIUS}
                                    color={DEFAULT_CHART_COLOR}
                                />
                            </>
                        )}
                    </CartesianChart>
                )}
                {isTooltipActive && !!tooltipData && (
                    <Animated.View style={tooltipStyle}>
                        <ChartTooltip
                            label={tooltipData.label}
                            amount={tooltipData.amount}
                            percentage={tooltipData.percentage}
                        />
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

export default LineChartContent;
export type {LineChartProps};
