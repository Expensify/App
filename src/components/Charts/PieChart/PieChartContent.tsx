import type { Color } from '@shopify/react-native-skia';
import React, { useCallback, useState } from 'react';
import type { ColorValue, LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Pie, PolarChart } from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import { getChartColor } from '@components/Charts/chartColors';
import ChartHeader from '@components/Charts/ChartHeader';
import ChartTooltip from '@components/Charts/ChartTooltip';
import { PIE_CHART_MAX_SLICES, PIE_CHART_MIN_SLICE_PERCENTAGE, PIE_CHART_OTHER_LABEL, PIE_CHART_START_ANGLE, TOOLTIP_BAR_GAP } from '@components/Charts/constants';
import type { PieChartDataPoint, PieChartProps, ProcessedSlice } from '@components/Charts/types';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';


/**
 * Process raw data into slices with aggregation logic.
 * - Slices below minPercentage are aggregated into "Other"
 * - If more than maxSlices, smallest are aggregated into "Other"
 */
function processDataIntoSlices(data: PieChartDataPoint[], startAngle: number): ProcessedSlice[] {
    if (data.length === 0) {
        return [];
    }

    const total = data.reduce((sum, point) => sum + point.value, 0);
    if (total === 0) {
        return [];
    }

    // Calculate percentages and sort by value descending
    const withPercentages = data.map((point, index) => ({
        ...point,
        percentage: (point.value / total) * 100,
        originalIndex: index,
    }));


    withPercentages.sort((a, b) => b.value - a.value);

    const validSlices = withPercentages.filter((slice) => slice.percentage >= PIE_CHART_MIN_SLICE_PERCENTAGE);
    const smallSlices = withPercentages.filter((slice) => slice.percentage < PIE_CHART_MIN_SLICE_PERCENTAGE);

    // If we have more than maxSlices, move smallest to "Other"
    while (validSlices.length > PIE_CHART_MAX_SLICES - (smallSlices.length > 0 ? 1 : 0)) {
        const smallest = validSlices.pop();
        if (smallest) {
            smallSlices.push(smallest);
        }
    }

    // Build final slices array
    const finalSlices: ProcessedSlice[] = [];
    let currentAngle = startAngle;

    // Add valid slices
    for (let index = 0; index < validSlices.length; index++) {
        const slice = validSlices.at(index);
        if (!slice) {
            continue;
        }
        const sweepAngle = (slice.value / total) * 360;
        const color = getChartColor(index);
        finalSlices.push({
            label: slice.label,
            value: slice.value,
            color,
            percentage: slice.percentage,
            startAngle: currentAngle,
            endAngle: currentAngle + sweepAngle,
            originalIndex: slice.originalIndex,
            isOther: false,
        });
        currentAngle += sweepAngle;
    }

    // Add "Other /" slice if there are small slices
    if (smallSlices.length > 0) {
        const otherValue = smallSlices.reduce((sum, s) => sum + s.value, 0);
        const otherPercentage = (otherValue / total) * 100;
        const sweepAngle = (otherValue / total) * 360;

        const otherColor = getChartColor(validSlices.length);
        finalSlices.push({
            label: PIE_CHART_OTHER_LABEL,
            value: otherValue,
            color: otherColor,
            percentage: otherPercentage,
            startAngle: currentAngle,
            endAngle: currentAngle + sweepAngle,
            originalIndex: -1,
            isOther: true,
        });
    }

    return finalSlices;
}

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(angle: number): number {
    'worklet';

    let normalized = angle % 360;
    if (normalized < 0) {
        normalized += 360;
    }
    return normalized;
}

/**
 * Check if an angle is within a slice's range (handles wrap-around)
 */
function isAngleInSlice(angle: number, startAngle: number, endAngle: number): boolean {
    'worklet';

    const normalizedAngle = normalizeAngle(angle);
    const normalizedStart = normalizeAngle(startAngle);
    const normalizedEnd = normalizeAngle(endAngle);

    // Handle wrap-around case (slice crosses 0°)
    if (normalizedStart > normalizedEnd) {
        return normalizedAngle >= normalizedStart || normalizedAngle < normalizedEnd;
    }
    return normalizedAngle >= normalizedStart && normalizedAngle < normalizedEnd;
}

/**
 * Find which slice index contains the given cursor position
 */
function findSliceAtPosition(cursorX: number, cursorY: number, centerX: number, centerY: number, radius: number, innerRadius: number, slices: ProcessedSlice[]): number {
    'worklet';

    // Convert cursor to polar coordinates relative to center
    const dx = cursorX - centerX;
    const dy = cursorY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if within pie ring
    if (distance < innerRadius || distance > radius) {
        return -1;
    }

    // Calculate angle in degrees (atan2 returns radians, 0 at 3 o'clock, positive clockwise)
    const cursorAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Find which slice contains this angle
    for (let i = 0; i < slices.length; i++) {
        const slice = slices.at(i);
        if (slice && isAngleInSlice(cursorAngle, slice.startAngle, slice.endAngle)) {
            return i;
        }
    }

    return -1;
}

function PieChartContent({ data, title, titleIcon, isLoading, valueUnit, onSlicePress }: PieChartProps) {
    const styles = useThemeStyles();
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [activeSliceIndex, setActiveSliceIndex] = useState(-1);

    // Shared values for hover state
    const isHovering = useSharedValue(false);
    const cursorX = useSharedValue(0);
    const cursorY = useSharedValue(0);

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setCanvasSize({ width, height });
    };

    // Process data into slices with aggregation, make following code react compiler compatible
    const processedSlices: ProcessedSlice[] = processDataIntoSlices(data, PIE_CHART_START_ANGLE);

    // Calculate pie geometry
    const pieGeometry = { radius: Math.min(canvasSize.width, canvasSize.height) / 2, centerX: canvasSize.width / 2, centerY: canvasSize.height / 2 } as const;

    // Transform data for Victory Native PolarChart
    const chartData = processedSlices.map((slice: { label: string; value: number; color: Color }) => ({
        label: slice.label,
        value: slice.value,
        color: slice.color,
    }));

    // Handle hover state updates
    const updateActiveSlice = (x: number, y: number) => {
        const { radius, centerX, centerY } = pieGeometry;
        const sliceIndex = findSliceAtPosition(x, y, centerX, centerY, radius, 0, processedSlices);
        setActiveSliceIndex(sliceIndex);
    };

    // Handle slice press callback
    const handleSlicePress = (sliceIndex: number) => {
        if (sliceIndex < 0 || sliceIndex >= processedSlices.length) {
            return;
        }
        const slice = processedSlices.at(sliceIndex);
        if (!slice || slice.isOther) {
            // Don't navigate for "Other" slice
            return;
        }
        const originalDataPoint = data.at(slice.originalIndex);
        if (originalDataPoint && onSlicePress) {
            onSlicePress(originalDataPoint, slice.originalIndex);
        }
    };

    // Hover gesture
    const hoverGesture = () =>
        Gesture.Hover()
            .onBegin((e) => {
                'worklet';

                isHovering.set(true);
                cursorX.set(e.x);
                cursorY.set(e.y);
                scheduleOnRN(updateActiveSlice, e.x, e.y);
            })
            .onUpdate((e) => {
                'worklet';

                cursorX.set(e.x);
                cursorY.set(e.y);
                scheduleOnRN(updateActiveSlice, e.x, e.y);
            })
            .onEnd(() => {
                'worklet';

                isHovering.set(false);
                scheduleOnRN(setActiveSliceIndex, -1);
            });

    // Tap gesture for click/tap navigation
    const tapGesture = () =>
        Gesture.Tap().onEnd((e) => {
            'worklet';

            const { radius, centerX, centerY } = pieGeometry;
            const sliceIndex = findSliceAtPosition(e.x, e.y, centerX, centerY, radius, 0, processedSlices);

            if (sliceIndex >= 0) {
                scheduleOnRN(handleSlicePress, sliceIndex);
            }
        });

    // Combined gestures - Race allows both hover and tap to work independently
    const combinedGesture = Gesture.Race(hoverGesture(), tapGesture());

    // Tooltip data
    const tooltipData = () => {
        if (activeSliceIndex < 0 || activeSliceIndex >= processedSlices.length) {
            return null;
        }
        const slice = processedSlices.at(activeSliceIndex);
        if (!slice) {
            return null;
        }
        const formattedValue = valueUnit ? `${valueUnit}${slice.value.toLocaleString()}` : slice.value.toLocaleString();
        const formattedPercentage = `${slice.percentage.toFixed(1)}%`;
        return {
            label: slice.label,
            amount: formattedValue,
            percentage: formattedPercentage,
        };
    };

    // Tooltip position (at cursor)
    const tooltipStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            left: cursorX.get(),
            top: cursorY.get() - TOOLTIP_BAR_GAP,
            transform: [{ translateX: '-50%' }, { translateY: '-100%' }],
            opacity: isHovering.get() ? 1 : 0,
            pointerEvents: 'none',
        };
    });

    const renderLegendItem = useCallback(
        (slice: { label: string; value: number; color: Color }) => {
            return (
                <View key={`legend-${slice.label}`} style={[styles.flexRow, styles.alignItemsCenter, styles.mr4, styles.mb2]}>
                    <View style={[styles.pieChartLegendDot, { backgroundColor: slice.color as ColorValue | undefined }]} />
                    <Text style={[styles.textNormal, styles.ml2]}>{slice.label}</Text>
                </View>
            );
        },
        [styles],
    )

    if (isLoading) {
        return (
            <View style={[styles.pieChartContainer, styles.highlightBG, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <View style={[styles.pieChartContainer, styles.highlightBG]}>
            <ChartHeader
                title={title}
                titleIcon={titleIcon}
            />

            <View
                style={styles.pieChartChartContainer}
                onLayout={handleLayout}
            >
                {canvasSize.width > 0 && canvasSize.height > 0 && chartData.length > 0 && (
                    <PolarChart
                        data={chartData}
                        labelKey="label"
                        valueKey="value"
                        colorKey="color"
                    >
                        <Pie.Chart startAngle={PIE_CHART_START_ANGLE} />
                    </PolarChart>
                )}

                {/* Hover and tap detection overlay */}
                <GestureDetector gesture={combinedGesture}>
                    <Animated.View style={styles.pieChartHoverOverlay} />
                </GestureDetector>

                {/* Tooltip */}
                {activeSliceIndex >= 0 && !!tooltipData && (
                    <Animated.View style={tooltipStyle}>
                        <ChartTooltip
                            label={tooltipData()?.label ?? ''}
                            amount={tooltipData()?.amount ?? ''}
                            percentage={tooltipData()?.percentage ?? ''}
                        />
                    </Animated.View>
                )}
            </View>
            <View style={styles.pieChartLegendContainer}>
                {chartData.map((slice) => (
                    renderLegendItem(slice)
                ))}
            </View>
        </View>
    );
}

export default PieChartContent;
