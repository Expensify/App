import ActivityIndicator from '@components/ActivityIndicator';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import {TOOLTIP_BAR_GAP, useChartLabelFormats, useTooltipData} from '@components/Charts/hooks';
import type {ChartDataPoint, ChartProps, PieSlice, UnitPosition} from '@components/Charts/types';
import {findSliceAtPosition, processDataIntoSlices} from '@components/Charts/utils';
import VictoryTheme from '@components/Charts/VictoryTheme';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {Pie, PolarChart} from 'victory-native';

import PaddedPieSlice from './PaddedPieSlice';

type PieChartProps = ChartProps & {
    /** Callback when a slice is pressed */
    onSlicePress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Symbol/unit for value labels in tooltip (e.g., '$', '€'). */
    valueUnit?: string;

    /** Position of the unit symbol relative to the value. Defaults to 'left'. */
    valueUnitPosition?: UnitPosition;
};

function PieChartContent({data, isLoading, valueUnit, valueUnitPosition, onSlicePress}: PieChartProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const [activeSliceIndex, setActiveSliceIndex] = useState(-1);
    const [isHoveringOverPie, setIsHoveringOverPie] = useState(false);

    // Shared values for hover state
    const isHovering = useSharedValue(false);
    const cursorX = useSharedValue(0);
    const cursorY = useSharedValue(0);
    const tooltipPosition = useSharedValue({x: 0, y: 0});

    const handleLayout = (event: LayoutChangeEvent) => {
        setCanvasWidth(event.nativeEvent.layout.width);
        setCanvasHeight(event.nativeEvent.layout.height);
    };

    // Calculate pie geometry
    const radius = Math.min(canvasWidth, canvasHeight) / 2;
    const innerRadius = radius * VictoryTheme.pie.innerRadiusRatio;
    const pieGeometry = {radius, innerRadius, centerX: canvasWidth / 2, centerY: canvasHeight / 2};

    // Slices are sorted by absolute value (largest first) for color assignment,
    // so slice indices don't match the original data array. We map back via
    // originalIndex so the tooltip can display the original (possibly negative) value.
    const processedSlices = processDataIntoSlices(data, pieGeometry);
    const activeOriginalDataIndex = activeSliceIndex >= 0 ? (processedSlices.at(activeSliceIndex)?.originalIndex ?? -1) : -1;

    const {formatValue} = useChartLabelFormats({data, unit: valueUnit, unitPosition: valueUnitPosition});
    const tooltipData = useTooltipData(activeOriginalDataIndex, data, formatValue);

    // Handle hover state updates
    const updateActiveSlice = (x: number, y: number) => {
        const {centerX, centerY} = pieGeometry;
        const sliceIndex = findSliceAtPosition(x, y, centerX, centerY, radius, innerRadius, processedSlices);
        setActiveSliceIndex(sliceIndex);
        setIsHoveringOverPie(sliceIndex >= 0);
    };

    // Handle slice press callback
    const handleSlicePress = (sliceIndex: number) => {
        if (sliceIndex < 0 || sliceIndex >= processedSlices.length) {
            return;
        }
        const slice = processedSlices.at(sliceIndex);
        if (!slice) {
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
                tooltipPosition.set({x: e.x, y: e.y - TOOLTIP_BAR_GAP});
                scheduleOnRN(updateActiveSlice, e.x, e.y);
            })
            .onUpdate((e) => {
                'worklet';

                cursorX.set(e.x);
                cursorY.set(e.y);
                tooltipPosition.set({x: e.x, y: e.y - TOOLTIP_BAR_GAP});
                scheduleOnRN(updateActiveSlice, e.x, e.y);
            })
            .onEnd(() => {
                'worklet';

                isHovering.set(false);
                scheduleOnRN(setActiveSliceIndex, -1);
                scheduleOnRN(setIsHoveringOverPie, false);
            });

    // Tap gesture for click/tap navigation
    const tapGesture = () =>
        Gesture.Tap().onEnd((e) => {
            'worklet';

            const {centerX, centerY} = pieGeometry;
            const sliceIndex = findSliceAtPosition(e.x, e.y, centerX, centerY, radius, innerRadius, processedSlices);

            if (sliceIndex >= 0) {
                scheduleOnRN(handleSlicePress, sliceIndex);
            }
        });

    // Combined gestures - Race allows both hover and tap to work independently
    const combinedGesture = Gesture.Race(hoverGesture(), tapGesture());

    const renderLegendItem = (slice: PieSlice) => {
        return (
            <View
                key={`legend-${slice.originalIndex}`}
                style={[styles.flexRow, styles.alignItemsCenter, styles.mr4, styles.mb2]}
                onMouseEnter={() => {
                    tooltipPosition.set(slice.tooltipPosition);
                    setActiveSliceIndex(slice.ordinalIndex);
                }}
                onMouseLeave={() => {
                    setActiveSliceIndex(-1);
                }}
            >
                <View style={[styles.pieChartLegendDot, {backgroundColor: slice.color}]} />
                <Text style={[styles.textNormal, styles.ml2]}>{slice.label}</Text>
            </View>
        );
    };

    if (isLoading) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'PieChartContent', isLoading};
        return (
            <View style={styles.chartActivityIndicator}>
                <ActivityIndicator
                    size="large"
                    reasonAttributes={reasonAttributes}
                />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <>
            <GestureDetector gesture={combinedGesture}>
                <Animated.View
                    style={[styles.chartContent, isHoveringOverPie && styles.cursorPointer]}
                    onLayout={handleLayout}
                >
                    {processedSlices.length > 0 && (
                        <PolarChart
                            data={processedSlices}
                            labelKey="label"
                            valueKey="value"
                            colorKey="color"
                        >
                            <Pie.Chart
                                startAngle={VictoryTheme.pie.startAngle}
                                innerRadius={`${VictoryTheme.pie.innerRadiusRatio * 100}%`}
                            >
                                {({slice}) => (
                                    <PaddedPieSlice
                                        slice={slice}
                                        padAngle={VictoryTheme.pie.padAngle}
                                    />
                                )}
                            </Pie.Chart>
                        </PolarChart>
                    )}

                    {processedSlices.length > 0 && (
                        <View
                            pointerEvents="none"
                            style={styles.pieChartCenterLabel}
                        >
                            <Text style={[styles.textLabelSupporting, styles.textAlignCenter]}>{translate('common.total')}</Text>
                            <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                style={[styles.textHeadlineH1, styles.textAlignCenter]}
                            >
                                {formatValue(data.reduce((sum, point) => sum + point.total, 0))}
                            </Text>
                        </View>
                    )}

                    {/* Tooltip */}
                    {activeSliceIndex >= 0 && !!tooltipData && (
                        <ChartTooltip
                            label={tooltipData.label}
                            amount={tooltipData.amount}
                            percentage={tooltipData.percentage}
                            chartWidth={canvasWidth}
                            initialTooltipPosition={tooltipPosition}
                        />
                    )}
                </Animated.View>
            </GestureDetector>
            <View style={styles.pieChartLegendContainer}>{processedSlices.map((slice) => renderLegendItem(slice))}</View>
        </>
    );
}

export default PieChartContent;
export type {PieChartProps};
