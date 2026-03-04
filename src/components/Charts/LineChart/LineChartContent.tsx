import {useFont} from '@shopify/react-native-skia';
import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';
import {CartesianChart, Line} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartHeader from '@components/Charts/components/ChartHeader';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import LeftFrameLine from '@components/Charts/components/LeftFrameLine';
import ScatterPoints from '@components/Charts/components/ScatterPoints';
import {AXIS_LABEL_GAP, CHART_CONTENT_MIN_HEIGHT, CHART_PADDING, X_AXIS_LINE_WIDTH, Y_AXIS_LINE_WIDTH, Y_AXIS_TICK_COUNT} from '@components/Charts/constants';
import fontSource from '@components/Charts/font';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartInteractions, useChartLabelFormats, useChartLabelLayout, useDynamicYDomain, useTooltipData} from '@components/Charts/hooks';
import type {CartesianChartProps, ChartDataPoint} from '@components/Charts/types';
import {calculateMinDomainPadding, DEFAULT_CHART_COLOR, measureTextWidth} from '@components/Charts/utils';
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
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);

    const yAxisDomain = useDynamicYDomain(data);
    const chartData = data.map((point, index) => ({
        x: index,
        y: point.total,
    }));

    const handlePointPress = (index: number) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onPointPress) {
            onPointPress(dataPoint, index);
        }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        setPlotAreaWidth(bounds.right - bounds.left);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
    };

    const domainPadding = (() => {
        if (chartWidth === 0 || data.length === 0) {
            return BASE_DOMAIN_PADDING;
        }

        const geometricPadding = calculateMinDomainPadding(chartWidth, data.length);

        if (!font) {
            return {...BASE_DOMAIN_PADDING, left: geometricPadding, right: geometricPadding};
        }

        const firstLabelWidth = measureTextWidth(data.at(0)?.label ?? '', font);
        const lastLabelWidth = measureTextWidth(data.at(-1)?.label ?? '', font);

        const firstLabelNeeds = firstLabelWidth / 2;
        const lastLabelNeeds = lastLabelWidth / 2;

        const wastedLeft = geometricPadding - firstLabelNeeds;
        const wastedRight = geometricPadding - lastLabelNeeds;
        const reclaimablePadding = Math.min(wastedLeft, wastedRight);

        if (reclaimablePadding <= 0) {
            return {...BASE_DOMAIN_PADDING, left: geometricPadding, right: geometricPadding};
        }

        const horizontalPadding = Math.max(geometricPadding - reclaimablePadding, MIN_SAFE_PADDING);
        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding};
    })();

    const tickSpacing = plotAreaWidth > 0 && data.length > 0 ? plotAreaWidth / data.length : 0;

    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = plotAreaWidth > 0 ? plotAreaWidth / (plotAreaWidth + totalDomainPadding) : 0;

    const {labelRotation, labelSkipInterval, truncatedLabels, xAxisLabelHeight} = useChartLabelLayout({
        data,
        font,
        tickSpacing,
        labelAreaWidth: plotAreaWidth,
        firstTickLeftSpace: boundsLeft + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - boundsRight + domainPadding.right * paddingScale : 0,
        allowTightDiagonalPacking: true,
    });

    const {formatValue} = useChartLabelFormats({
        data,
        font,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const checkIsOverDot = (args: HitTestArgs) => {
        'worklet';

        const dx = args.cursorX - args.targetX;
        const dy = args.cursorY - args.targetY;
        return Math.sqrt(dx * dx + dy * dy) <= DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;
    };

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
            const labelY = args.chartBottom + AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad) - variables.iconSizeExtraSmall / 3;
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

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        return (
            <>
                <LeftFrameLine
                    chartBounds={args.chartBounds}
                    yTicks={args.yTicks}
                    yScale={args.yScale}
                    color={theme.border}
                />
                <ScatterPoints
                    points={args.points.y}
                    radius={DOT_RADIUS}
                    color={DEFAULT_CHART_COLOR}
                />
                {!!font && xAxisLabelHeight !== undefined && (
                    <ChartXAxisLabels
                        labels={truncatedLabels}
                        labelRotation={labelRotation}
                        labelSkipInterval={labelSkipInterval}
                        font={font}
                        labelColor={theme.textSupporting}
                        xScale={args.xScale}
                        chartBoundsBottom={args.chartBounds.bottom}
                    />
                )}
            </>
        );
    };

    const labelSpace = AXIS_LABEL_GAP + (xAxisLabelHeight ?? 0);
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const chartPadding = {...CHART_PADDING, bottom: labelSpace + CHART_PADDING.bottom};

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
                            padding={chartPadding}
                            yKeys={['y']}
                            domainPadding={domainPadding}
                            actionsRef={actionsRef}
                            customGestures={customGestures}
                            onChartBoundsChange={handleChartBoundsChange}
                            onScaleChange={handleScaleChange}
                            renderOutside={renderOutside}
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
                            frame={{lineWidth: 0}}
                            data={chartData}
                        >
                            {({points}) => (
                                <Line
                                    points={points.y}
                                    color={DEFAULT_CHART_COLOR}
                                    strokeWidth={2}
                                    curveType="linear"
                                />
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
