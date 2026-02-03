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
import {LABEL_ROTATIONS, useChartInteractions, useChartLabelFormats, useChartLabelLayout, useDynamicYDomain, useTooltipData} from '@components/Charts/hooks';
import type {CartesianChartProps, ChartDataPoint} from '@components/Charts/types';
import {DEFAULT_CHART_COLOR, measureTextWidth} from '@components/Charts/utils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/** Inner dot radius for line chart data points */
const DOT_RADIUS = 6;

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
    const [containerHeight, setContainerHeight] = useState(0);
    const [plotAreaWidth, setPlotAreaWidth] = useState(0);

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
        const {width, height} = event.nativeEvent.layout;
        setChartWidth(width);
        setContainerHeight(height);
    }, []);

    const handleChartBoundsChange = useCallback((bounds: ChartBounds) => {
        setPlotAreaWidth(bounds.right - bounds.left);
    }, []);

    const {labelRotation, labelSkipInterval, truncatedLabels, maxLabelLength} = useChartLabelLayout({
        data,
        font,
        chartWidth,
        barAreaWidth: plotAreaWidth,
        containerHeight,
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

    const {formatXAxisLabel, formatYAxisLabel} = useChartLabelFormats({
        data,
        yAxisUnit,
        yAxisUnitPosition,
        labelSkipInterval,
        labelRotation,
        truncatedLabels,
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
    // which works well for bar charts where bars have width and natural spacing.
    // For line charts, data points sit at the edges of the plot area, so centered
    // labels get clipped or overflow the chart bounds. We render labels manually
    // via `renderOutside` so we can right-align each label's last character at its
    // tick position and clamp edge labels within the canvas.
    const renderCustomXLabels = useCallback(
        (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
            if (!font) {
                return null;
            }

            const fontMetrics = font.getMetrics();
            const lineHeight = Math.abs(fontMetrics.ascent) + Math.abs(fontMetrics.descent);
            const fontSize = font.getSize();
            const labelY = args.chartBounds.bottom + 2 + fontSize;

            return truncatedLabels.map((label, i) => {
                if (i % labelSkipInterval !== 0) {
                    return null;
                }

                const tickX = args.xScale(i);
                const labelWidth = labelWidths.at(i) ?? 0;

                // Last character anchored at tickX, clamped to canvas edges.
                const idealX = tickX - labelWidth;
                const clampedX = Math.max(0, Math.min(args.canvasSize.width - labelWidth, idealX));

                if (angleRad === 0) {
                    return (
                        <SkiaText
                            key={`x-label-${label}`}
                            x={clampedX}
                            y={labelY}
                            text={label}
                            font={font}
                            color={theme.textSupporting}
                        />
                    );
                }

                // At 90° the rotated label's horizontal footprint is lineHeight;
                // shift by half to center it on the tick mark.
                const centeringOffset = labelRotation === -LABEL_ROTATIONS.VERTICAL ? lineHeight / 2 : 0;
                const origin = vec(clampedX + labelWidth + centeringOffset, labelY);
                return (
                    <Group
                        key={`x-label-${label}`}
                        origin={origin}
                        transform={[{rotate: -angleRad}]}
                    >
                        <SkiaText
                            x={clampedX}
                            y={labelY}
                            text={label}
                            font={font}
                            color={theme.textSupporting}
                        />
                    </Group>
                );
            });
        },
        [font, truncatedLabels, labelSkipInterval, labelWidths, angleRad, labelRotation, theme.textSupporting],
    );

    const dynamicChartStyle = useMemo(
        () => ({
            height: CHART_CONTENT_MIN_HEIGHT + (maxLabelLength ?? 0),
        }),
        [maxLabelLength],
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
                style={[styles.lineChartChartContainer, labelRotation === -LABEL_ROTATIONS.VERTICAL ? dynamicChartStyle : undefined]}
                onLayout={handleLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        padding={CHART_PADDING}
                        yKeys={['y']}
                        domainPadding={16}
                        actionsRef={actionsRef}
                        customGestures={customGestures}
                        onChartBoundsChange={handleChartBoundsChange}
                        renderOutside={renderCustomXLabels}
                        xAxis={{
                            font,
                            tickCount: data.length,
                            labelColor: 'transparent',
                            lineWidth: X_AXIS_LINE_WIDTH,
                            formatXLabel: formatXAxisLabel,
                            labelRotate: labelRotation,
                            labelOverflow: 'visible',
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
