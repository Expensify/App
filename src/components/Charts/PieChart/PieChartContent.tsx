import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {Pie, PolarChart} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartHeader from '@components/Charts/components/ChartHeader';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import {PIE_CHART_START_ANGLE} from '@components/Charts/constants';
import {TOOLTIP_BAR_GAP, useChartLabelFormats, useTooltipData} from '@components/Charts/hooks';
import type {ChartDataPoint, ChartProps, PieSlice, UnitPosition} from '@components/Charts/types';
import {findSliceAtPosition, processDataIntoSlices} from '@components/Charts/utils';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type PieChartProps = ChartProps & {
    /** Callback when a slice is pressed */
    onSlicePress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Symbol/unit for value labels in tooltip (e.g., '$', '€'). */
    valueUnit?: string;

    /** Position of the unit symbol relative to the value. Defaults to 'left'. */
    valueUnitPosition?: UnitPosition;
};

function PieChartContent({data, title, titleIcon, isLoading, valueUnit, valueUnitPosition, onSlicePress}: PieChartProps) {
    const styles = useThemeStyles();
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const [activeSliceIndex, setActiveSliceIndex] = useState(-1);

    // Shared values for hover state
    const isHovering = useSharedValue(false);
    const cursorX = useSharedValue(0);
    const cursorY = useSharedValue(0);
    const tooltipPosition = useSharedValue({x: 0, y: 0});

    const handleLayout = (event: LayoutChangeEvent) => {
        setCanvasWidth(event.nativeEvent.layout.width);
        setCanvasHeight(event.nativeEvent.layout.height);
    };

    // Slices are sorted by absolute value (largest first) for color assignment,
    // so slice indices don't match the original data array. We map back via
    // originalIndex so the tooltip can display the original (possibly negative) value.
    const processedSlices = processDataIntoSlices(data, PIE_CHART_START_ANGLE);
    const activeOriginalDataIndex = activeSliceIndex >= 0 ? (processedSlices.at(activeSliceIndex)?.originalIndex ?? -1) : -1;

    const {formatValue} = useChartLabelFormats({data, unit: valueUnit, unitPosition: valueUnitPosition});
    const tooltipData = useTooltipData(activeOriginalDataIndex, data, formatValue);

    // Calculate pie geometry
    const pieGeometry = {radius: Math.min(canvasWidth, canvasHeight) / 2, centerX: canvasWidth / 2, centerY: canvasHeight / 2};

    // Handle hover state updates
    const updateActiveSlice = (x: number, y: number) => {
        const {radius, centerX, centerY} = pieGeometry;
        const sliceIndex = findSliceAtPosition(x, y, centerX, centerY, radius, 0, processedSlices);
        setActiveSliceIndex(sliceIndex);
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
            });

    // Tap gesture for click/tap navigation
    const tapGesture = () =>
        Gesture.Tap().onEnd((e) => {
            'worklet';

            const {radius, centerX, centerY} = pieGeometry;
            const sliceIndex = findSliceAtPosition(e.x, e.y, centerX, centerY, radius, 0, processedSlices);

            if (sliceIndex >= 0) {
                scheduleOnRN(handleSlicePress, sliceIndex);
            }
        });

    // Combined gestures - Race allows both hover and tap to work independently
    const combinedGesture = Gesture.Race(hoverGesture(), tapGesture());

    const renderLegendItem = (slice: PieSlice) => {
        return (
            <View
                key={`legend-${slice.label}`}
                style={[styles.flexRow, styles.alignItemsCenter, styles.mr4, styles.mb2]}
            >
                <View style={[styles.pieChartLegendDot, {backgroundColor: slice.color}]} />
                <Text style={[styles.textNormal, styles.ml2]}>{slice.label}</Text>
            </View>
        );
    };

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

            <GestureDetector gesture={combinedGesture}>
                <Animated.View
                    style={styles.pieChartChartContainer}
                    onLayout={handleLayout}
                >
                    {processedSlices.length > 0 && (
                        <PolarChart
                            data={processedSlices}
                            labelKey="label"
                            valueKey="value"
                            colorKey="color"
                        >
                            <Pie.Chart startAngle={PIE_CHART_START_ANGLE} />
                        </PolarChart>
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
        </View>
    );
}

export default PieChartContent;
export type {PieChartProps};
