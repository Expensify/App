import {Group, Text as SkiaText, useFont, vec} from '@shopify/react-native-skia';
import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';
import {CartesianChart, Line, Scatter} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartHeader from '@components/Charts/components/ChartHeader';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import {AXIS_LABEL_GAP, CHART_CONTENT_MIN_HEIGHT, CHART_PADDING, X_AXIS_LINE_WIDTH, Y_AXIS_LINE_WIDTH, Y_AXIS_TICK_COUNT} from '@components/Charts/constants';
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

/** Minimum safe padding to avoid clipping labels/points */
const MIN_SAFE_PADDING = DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;

/** Base domain padding applied to all sides */
const BASE_DOMAIN_PADDING = {top: 16, bottom: 16, left: 0, right: 0};

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

    const chartBottom = useSharedValue(0);

    /** Pixel-space X position of each tick, filled by onScaleChange and used for label hit-testing */
    const tickXPositions = useSharedValue<number[]>([]);

    const handleScaleChange = useCallback(
        (xScale: Scale, _yScale: Scale) => {
            tickXPositions.set(data.map((_, i) => xScale(i)));
        },
        [data, tickXPositions],
    );

    const handleChartBoundsChange = useCallback(
        (bounds: ChartBounds) => {
            setPlotAreaWidth(bounds.right - bounds.left);
            chartBottom.set(bounds.bottom);
        },
        [chartBottom],
    );

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
        const reclaimablePadding = Math.min(wastedLeft, wastedRight);

        // Only reduce if both sides have excess space (labels short enough for 0°)
        // If reclaimablePadding <= 0, labels are too long and hook will use rotation/truncation
        const shouldUseExtraPadding = reclaimablePadding > 0;
        const horizontalPadding = Math.max(shouldUseExtraPadding ? geometricPadding - reclaimablePadding : geometricPadding, MIN_SAFE_PADDING);

        // If shouldUseExtraPadding is true then we have to add the extra padding to the right so the label is not clipped
        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding + (shouldUseExtraPadding ? MIN_SAFE_PADDING : 0)};
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

    const {formatValue} = useChartLabelFormats({
        data,
        font,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const checkIsOverDot = useCallback((args: HitTestArgs) => {
        'worklet';

        const dx = args.cursorX - args.targetX;
        const dy = args.cursorY - args.targetY;
        return Math.sqrt(dx * dx + dy * dy) <= DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;
    }, []);

    const checkIsOverLabel = useCallback(
        (args: HitTestArgs, activeIndex: number) => {
            'worklet';

            const labelWidth = labelWidths.at(activeIndex) ?? 0;
            const fontMetrics = font?.getMetrics();
            if (!fontMetrics) {
                return false;
            }
            const ascent = Math.abs(fontMetrics.ascent);
            const descent = Math.abs(fontMetrics.descent);
            // center of label when looking vertically
            const labelY = args.chartBottom + AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad) - variables.iconSizeExtraSmall / 2;
            if (angleRad === 0) {
                return (
                    args.cursorY >= labelY - variables.iconSizeExtraSmall / 2 &&
                    args.cursorY <= labelY + variables.iconSizeExtraSmall / 2 &&
                    args.cursorX >= args.targetX - labelWidth / 2 &&
                    args.cursorX <= args.targetX + labelWidth / 2
                );
            }
            // When labels are rotated 45° we need to check it the other way
            if (angleRad < 1) {
                console.log('activeIndex', activeIndex);
                const rightUpperCorner = {
                    x: args.targetX - (variables.iconSizeExtraSmall / 3) * Math.sin(angleRad),
                    y: labelY + (variables.iconSizeExtraSmall / 3) * Math.sin(angleRad),
                };
                const rightLowerCorner = {
                    x: rightUpperCorner.x + variables.iconSizeExtraSmall * Math.sin(angleRad),
                    y: rightUpperCorner.y + variables.iconSizeExtraSmall * Math.sin(angleRad),
                };
                const leftUpperCorner = {
                    x: rightUpperCorner.x - labelWidth * Math.sin(angleRad),
                    y: rightUpperCorner.y + labelWidth * Math.sin(angleRad),
                };
                const leftLowerCorner = {
                    x: rightLowerCorner.x - labelWidth * Math.sin(angleRad),
                    y: rightLowerCorner.y + labelWidth * Math.sin(angleRad),
                };

                // Point-in-convex-polygon test using cross products
                // Vertices in clockwise order: rightUpper -> rightLower -> leftLower -> leftUpper
                const corners = [rightUpperCorner, rightLowerCorner, leftLowerCorner, leftUpperCorner];
                const px = args.cursorX;
                const py = args.cursorY;
                let sign = 0;
                for (let i = 0; i < corners.length; i++) {
                    const a = corners.at(i);
                    const b = corners.at((i + 1) % corners.length);
                    if (a == null || b == null) {
                        continue;
                    }
                    const cross = (b.x - a.x) * (py - a.y) - (b.y - a.y) * (px - a.x);
                    if (cross !== 0) {
                        const crossSign = cross > 0 ? 1 : -1;
                        if (sign === 0) {
                            sign = crossSign;
                        } else if (crossSign !== sign) {
                            return false;
                        }
                    }
                }
                return true;
            }
            // the last case when labels are rotated 90°
            return (
                args.cursorX >= args.targetX - variables.iconSizeExtraSmall / 2 &&
                args.cursorX <= args.targetX + variables.iconSizeExtraSmall / 2 &&
                args.cursorY >= labelY + variables.iconSizeExtraSmall / 2 &&
                args.cursorY <= labelY + labelWidth + variables.iconSizeExtraSmall / 2
            );
        },
        [angleRad, font, labelWidths],
    );

    /**
     * Scans every visible label's bounding box using its own tick X as the anchor.
     * Returns that tick's X position when the cursor is inside, otherwise returns
     * the raw cursor X unchanged.
     * Used to correct Victory's nearest-point-by-X algorithm for rotated labels whose
     * bounding boxes can extend past the midpoint to the adjacent tick.
     */
    const findLabelCursorX = useCallback(
        (cursorX: number, cursorY: number): number => {
            'worklet';

            const positions = tickXPositions.get();
            const currentChartBottom = chartBottom.get();
            for (let i = 0; i < positions.length; i++) {
                if (i % labelSkipInterval !== 0) {
                    continue;
                }
                const tickX = positions.at(i);
                if (tickX === undefined) {
                    continue;
                }
                if (checkIsOverLabel({cursorX, cursorY, targetX: tickX, targetY: 0, chartBottom: currentChartBottom}, i)) {
                    return tickX;
                }
            }
            return cursorX;
        },
        [tickXPositions, chartBottom, labelSkipInterval, checkIsOverLabel],
    );

    const {actionsRef, customGestures, hoverGesture, activeDataIndex, isTooltipActive, initialTooltipPosition} = useChartInteractions({
        handlePress: handlePointPress,
        checkIsOver: checkIsOverDot,
        checkIsOverLabel,
        resolveLabelTouchX: findLabelCursorX,
        chartBottom,
    });

    const tooltipData = useTooltipData(activeDataIndex, data, formatValue);

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
            const labelY = args.chartBounds.bottom + AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad);

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
            <GestureDetector gesture={hoverGesture}>
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
                            onScaleChange={handleScaleChange}
                            renderOutside={renderCustomXLabels}
                            xAxis={{
                                tickCount: data.length,
                                lineWidth: X_AXIS_LINE_WIDTH,
                            }}
                            yAxis={[
                                {
                                    font,
                                    labelColor: theme.textSupporting,
                                    formatYLabel: formatValue,
                                    tickCount: Y_AXIS_TICK_COUNT,
                                    lineWidth: Y_AXIS_LINE_WIDTH,
                                    lineColor: theme.border,
                                    labelOffset: AXIS_LABEL_GAP,
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
                        <ChartTooltip
                            label={tooltipData.label}
                            amount={tooltipData.amount}
                            percentage={tooltipData.percentage}
                            chartWidth={chartWidth}
                            initialTooltipPosition={initialTooltipPosition}
                        />
                    )}
                </View>
            </GestureDetector>
        </View>
    );
}

export default LineChartContent;
export type {LineChartProps};
