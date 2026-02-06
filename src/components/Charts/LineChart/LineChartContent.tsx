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
import {calculateMinDomainPadding, DEFAULT_CHART_COLOR, measureTextWidth, rotatedLabelCenterCorrection, rotatedLabelYOffset} from '@components/Charts/utils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/** Inner dot radius for line chart data points */
const DOT_RADIUS = 6;

/** Extra hover area beyond the dot radius for easier touch targeting */
const DOT_HOVER_EXTRA_RADIUS = 2;

/** Base domain padding applied to all sides */
const BASE_DOMAIN_PADDING = {top: 16, bottom: 16, left: 0, right: 0};

/** Consistent gap between x-axis and closest point of label (regardless of rotation) */
const LABEL_GAP = 8;

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
        setChartWidth(event.nativeEvent.layout.width);
    }, []);

    const handleChartBoundsChange = useCallback((bounds: ChartBounds) => {
        setPlotAreaWidth(bounds.right - bounds.left);
    }, []);

    // Calculate dynamic domain padding for centered labels
    // Optimize by reducing wasted space when edge labels are shorter than tick spacing
    const domainPadding = useMemo(() => {
        if (chartWidth === 0 || data.length === 0) {
            return BASE_DOMAIN_PADDING;
        }

        const geometricPadding = calculateMinDomainPadding(chartWidth, data.length);

        // Without font, use geometric padding (safe fallback)
        if (!font) {
            return {...BASE_DOMAIN_PADDING, left: geometricPadding, right: geometricPadding};
        }

        // Measure edge labels to see if we can reduce padding
        const firstLabelWidth = measureTextWidth(data.at(0)?.label ?? '', font);
        const lastLabelWidth = measureTextWidth(data.at(-1)?.label ?? '', font);

        // At 0° rotation, centered labels extend by half their width
        const firstLabelNeeds = firstLabelWidth / 2;
        const lastLabelNeeds = lastLabelWidth / 2;

        // How much space is wasted on each side
        const wastedLeft = geometricPadding - firstLabelNeeds;
        const wastedRight = geometricPadding - lastLabelNeeds;
        const canReduce = Math.min(wastedLeft, wastedRight);

        // Only reduce if both sides have excess space (labels short enough for 0°)
        // If canReduce <= 0, labels are too long and hook will use rotation/truncation
        const horizontalPadding = canReduce > 0 ? geometricPadding - canReduce : geometricPadding;

        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding};
    }, [chartWidth, data, font]);

    // For centered labels, tick spacing is evenly distributed across the plot area (same as BarChart)
    const tickSpacing = plotAreaWidth > 0 && data.length > 0 ? plotAreaWidth / data.length : 0;

    const {labelRotation, labelSkipInterval, truncatedLabels, xAxisLabelHeight} = useChartLabelLayout({
        data,
        font,
        tickSpacing,
        labelAreaWidth: plotAreaWidth,
        allowTightDiagonalPacking: true,
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
        return Math.sqrt(dx * dx + dy * dy) <= DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;
    }, []);

    const {actionsRef, customGestures, activeDataIndex, isTooltipActive, tooltipStyle} = useChartInteractions({
        handlePress: handlePointPress,
        checkIsOver: checkIsOverDot,
    });

    const tooltipData = useTooltipData(activeDataIndex, data, yAxisUnit, yAxisUnitPosition);

    // Custom x-axis labels with hybrid positioning:
    // - At 0° (horizontal): center label under the point (like bar chart)
    // - At 45° (rotated): right-align so the last character is under the point
    const renderCustomXLabels = useCallback(
        (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
            if (!font) {
                return null;
            }

            const fontMetrics = font.getMetrics();
            const ascent = Math.abs(fontMetrics.ascent);
            const descent = Math.abs(fontMetrics.descent);
            const labelY = args.chartBounds.bottom + LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad);

            return truncatedLabels.map((label, i) => {
                if (i % labelSkipInterval !== 0) {
                    return null;
                }

                const tickX = args.xScale(i);
                const labelWidth = labelWidths.at(i) ?? 0;

                // At 0°: center the label under the point (like bar chart)
                // At 45°: right-align so the last character is under the point
                if (angleRad === 0) {
                    return (
                        <SkiaText
                            key={`x-label-${label}`}
                            x={tickX - labelWidth / 2}
                            y={labelY}
                            text={label}
                            font={font}
                            color={theme.textSupporting}
                        />
                    );
                }

                const textX = tickX - labelWidth; // right-aligned for rotated labels
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
                        domainPadding={domainPadding}
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
