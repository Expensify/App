import {useFont} from '@shopify/react-native-skia';
import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';
import {Bar, CartesianChart} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartHeader from '@components/Charts/components/ChartHeader';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import {AXIS_LABEL_GAP, CHART_CONTENT_MIN_HEIGHT, CHART_PADDING, X_AXIS_LINE_WIDTH, Y_AXIS_LINE_WIDTH, Y_AXIS_TICK_COUNT} from '@components/Charts/constants';
import fontSource from '@components/Charts/font';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartInteractions, useChartLabelFormats, useChartLabelLayout, useDynamicYDomain, useTooltipData} from '@components/Charts/hooks';
import type {CartesianChartProps, ChartDataPoint} from '@components/Charts/types';
import {calculateMinDomainPadding, DEFAULT_CHART_COLOR, getChartColor, measureTextWidth, rotatedLabelYOffset} from '@components/Charts/utils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/** Inner padding between bars (0.3 = 30% of bar width) */
const BAR_INNER_PADDING = 0.3;

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop)
 * We need bottom: 1 for proper display of the bottom label
 */
const BASE_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

type BarChartProps = CartesianChartProps & {
    /** Callback when a bar is pressed */
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** When true, all bars use the same color. When false (default), each bar uses a different color from the palette. */
    useSingleColor?: boolean;
};

function BarChartContent({data, title, titleIcon, isLoading, yAxisUnit, yAxisUnitPosition = 'left', useSingleColor = false, onBarPress}: BarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const font = useFont(fontSource, variables.iconSizeExtraSmall);
    const [chartWidth, setChartWidth] = useState(0);
    const [barAreaWidth, setBarAreaWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);
    const defaultBarColor = DEFAULT_CHART_COLOR;

    const chartData = data.map((point, index) => ({
        x: index,
        y: point.total,
    }));

    const yAxisDomain = useDynamicYDomain(data);

    const handleBarPress = (index: number) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onBarPress) {
            onBarPress(dataPoint, index);
        }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    const domainPadding = (() => {
        if (chartWidth === 0) {
            return BASE_DOMAIN_PADDING;
        }
        const horizontalPadding = calculateMinDomainPadding(chartWidth, data.length, BAR_INNER_PADDING);
        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding};
    })();

    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = barAreaWidth > 0 ? barAreaWidth / (barAreaWidth + totalDomainPadding) : 0;

    const {labelRotation, labelSkipInterval, truncatedLabels, xAxisLabelHeight} = useChartLabelLayout({
        data,
        font,
        tickSpacing: barAreaWidth > 0 ? barAreaWidth / data.length : 0,
        labelAreaWidth: barAreaWidth,
        firstTickLeftSpace: boundsLeft + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - boundsRight + domainPadding.right * paddingScale : 0,
    });

    const {formatValue} = useChartLabelFormats({
        data,
        font,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const barWidth = useSharedValue(0);
    const chartBottom = useSharedValue(0);
    const yZero = useSharedValue(0);

    /** Pixel-space X position of each tick, filled by onScaleChange and used for label hit-testing */
    const tickXPositions = useSharedValue<number[]>([]);

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        const domainWidth = bounds.right - bounds.left;
        const calculatedBarWidth = ((1 - BAR_INNER_PADDING) * domainWidth) / data.length;
        barWidth.set(calculatedBarWidth);
        chartBottom.set(bounds.bottom);
        yZero.set(0);
        setBarAreaWidth(domainWidth);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
    };

    const handleScaleChange = useCallback(
        (xScale: Scale, yScale: Scale) => {
            yZero.set(yScale(0));
            tickXPositions.set(data.map((_, i) => xScale(i)));
        },
        [yZero, data, tickXPositions],
    );

    // Measure label widths for custom positioning in `renderOutside`
    const labelWidths = useMemo(() => {
        if (!font) {
            return [] as number[];
        }
        return truncatedLabels.map((label) => measureTextWidth(label, font));
    }, [font, truncatedLabels]);

    // Convert hook's degree rotation to radians for hover label testing
    const angleRad = (Math.abs(labelRotation) * Math.PI) / 180;

    /**
     * Pre-computed geometry for label hit-testing.
     * Extracted from the worklet so that font metrics, trig, spread-array max, and per-label
     * scaled widths are calculated once per layout/rotation change rather than on every hover event.
     */
    const labelHitGeometry = useMemo(() => {
        if (!font) {
            return null;
        }
        const metrics = font.getMetrics();
        const ascent = Math.abs(metrics.ascent);
        const descent = Math.abs(metrics.descent);
        const sinA = Math.sin(angleRad);
        const maxLabelWidth = labelWidths.length > 0 ? Math.max(...labelWidths) : 0;
        const centeredUpwardOffset = angleRad > 0 ? (maxLabelWidth / 2) * sinA : 0;
        return {
            /** Constant offset from chartBottom to the label Y baseline */
            labelYOffset: AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad) + centeredUpwardOffset - variables.iconSizeExtraSmall / 3,
            /** iconSize * sin(angle) — step from upper to lower corner */
            iconSin: variables.iconSizeExtraSmall * sinA,
            /** Per-label: (labelWidth / 2) * sin(angle) — right-corner anchor offset for 45° */
            halfLabelSins: labelWidths.map((w) => (w / 2) * sinA),
            /** Per-label: labelWidth * sin(angle) — left-corner offset for 45° */
            labelSins: labelWidths.map((w) => w * sinA),
            /** Per-label: labelWidth / 2 — bounds half-extent for 0° and 90° */
            halfWidths: labelWidths.map((w) => w / 2),
        };
    }, [font, angleRad, labelWidths]);

    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        const currentBarWidth = barWidth.get();
        const currentYZero = yZero.get();
        if (currentBarWidth === 0) {
            return false;
        }
        const barLeft = args.targetX - currentBarWidth / 2;
        const barRight = args.targetX + currentBarWidth / 2;

        const barTop = Math.min(args.targetY, currentYZero);
        const barBottom = Math.max(args.targetY, currentYZero);

        return args.cursorX >= barLeft && args.cursorX <= barRight && args.cursorY >= barTop && args.cursorY <= barBottom;
    };

    const checkIsOverLabel = useCallback(
        (args: HitTestArgs, activeIndex: number) => {
            'worklet';

            if (!labelHitGeometry) {
                return false;
            }
            const {labelYOffset, iconSin, halfLabelSins, labelSins, halfWidths} = labelHitGeometry;
            const halfLabelWidth = halfWidths.at(activeIndex) ?? 0;
            const labelY = args.chartBottom + labelYOffset;

            if (angleRad === 0) {
                return (
                    args.cursorX >= args.targetX - halfLabelWidth &&
                    args.cursorX <= args.targetX + halfLabelWidth &&
                    args.cursorY >= labelY - variables.iconSizeExtraSmall / 2 &&
                    args.cursorY <= labelY + variables.iconSizeExtraSmall / 2
                );
            }
            if (angleRad < 1) {
                const halfLabelSin = halfLabelSins.at(activeIndex) ?? 0;
                const labelSin = labelSins.at(activeIndex) ?? 0;
                const rightUpperCorner = {
                    x: args.targetX + halfLabelSin,
                    y: labelY - halfLabelSin,
                };
                const rightLowerCorner = {
                    x: rightUpperCorner.x + iconSin,
                    y: rightUpperCorner.y + iconSin,
                };
                const leftUpperCorner = {
                    x: rightUpperCorner.x - labelSin,
                    y: rightUpperCorner.y + labelSin,
                };
                const leftLowerCorner = {
                    x: rightLowerCorner.x - labelSin,
                    y: rightLowerCorner.y + labelSin,
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
            // 90°
            return (
                args.cursorX >= args.targetX - variables.iconSizeExtraSmall / 2 &&
                args.cursorX <= args.targetX + variables.iconSizeExtraSmall / 2 &&
                args.cursorY >= labelY - halfLabelWidth &&
                args.cursorY <= labelY + halfLabelWidth
            );
        },
        [angleRad, labelHitGeometry],
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
        handlePress: handleBarPress,
        checkIsOver: checkIsOverBar,
        checkIsOverLabel,
        resolveLabelTouchX: findLabelCursorX,
        chartBottom,
        yZero,
    });

    const tooltipData = useTooltipData(activeDataIndex, data, formatValue);

    const renderBar = (point: PointsArray[number], chartBounds: ChartBounds, barCount: number) => {
        const dataIndex = point.xValue as number;
        const dataPoint = data.at(dataIndex);
        const barColor = useSingleColor ? defaultBarColor : getChartColor(dataIndex);

        return (
            <Bar
                key={`bar-${dataPoint?.label}`}
                points={[point]}
                chartBounds={chartBounds}
                color={barColor}
                barCount={barCount}
                innerPadding={BAR_INNER_PADDING}
                roundedCorners={{topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8}}
            />
        );
    };

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        if (!font || xAxisLabelHeight === undefined) {
            return null;
        }
        return (
            <ChartXAxisLabels
                labels={truncatedLabels}
                labelRotation={labelRotation}
                labelSkipInterval={labelSkipInterval}
                font={font}
                labelColor={theme.textSupporting}
                xScale={args.xScale}
                chartBoundsBottom={args.chartBounds.bottom}
                centerRotatedLabels
            />
        );
    };

    const labelSpace = AXIS_LABEL_GAP + (xAxisLabelHeight ?? 0);
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const chartPadding = {...CHART_PADDING, bottom: labelSpace + CHART_PADDING.bottom};

    if (isLoading || !font) {
        return (
            <View style={[styles.barChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <View style={[styles.barChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8]}>
            <ChartHeader
                title={title}
                titleIcon={titleIcon}
            />
            <GestureDetector gesture={hoverGesture}>
                <View
                    style={[styles.barChartChartContainer, dynamicChartStyle]}
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
                            {({points, chartBounds}) => <>{points.y.map((point) => renderBar(point, chartBounds, points.y.length))}</>}
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

export default BarChartContent;
export type {BarChartProps};
