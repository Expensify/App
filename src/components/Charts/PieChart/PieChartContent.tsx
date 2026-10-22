import ActivityIndicator from '@components/ActivityIndicator';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import {CHART_GESTURE_TOUCH_ACTION, TOOLTIP_BAR_GAP, useChartLabelFormats, useTouchPinnedTooltip} from '@components/Charts/hooks';
import type {ChartDataPoint, ChartProps, PieSlice, UnitPosition} from '@components/Charts/types';
import {findSliceAtPosition, getPrimaryValue, processDataIntoSlices} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useState} from 'react';
import {View} from 'react-native';
import {GestureDetector, PointerType, useCompetingGestures, useHoverGesture, useTapGesture} from 'react-native-gesture-handler';
import Animated, {useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN, scheduleOnUI} from 'react-native-worklets';
import {Pie, PolarChart} from 'victory-native';

import PaddedPieSlice from './PaddedPieSlice';

type PieChartProps = ChartProps & {
    onSlicePress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Symbol/unit for value labels in tooltip (e.g., '$', '€'). */
    valueUnit?: string;

    /** Position of the unit symbol relative to the value. Defaults to 'left'. */
    valueUnitPosition?: UnitPosition;

    /** Whether to draw the slice legend below the donut */
    shouldShowLegend?: boolean;

    /** Whether the legend sits beside the donut when the card is wide enough (one row per slice) and stacks beneath it when it isn't, instead of the default wrapping row below the donut. */
    shouldUseResponsiveLegend?: boolean;
};

type PieChartContentProps = PieChartProps & {
    /** Null until the card has been measured. */
    chartWidth: number | null;
};

type PieChartCanvasProps = Omit<PieChartProps, 'isLoading'> & {
    chartWidth: number;
};

function PieChartCanvas({data, series, valueUnit, valueUnitPosition, onSlicePress, shouldShowLegend = true, shouldUseResponsiveLegend = false, chartWidth}: PieChartCanvasProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isHoveringOverPie, setIsHoveringOverPie] = useState(false);

    // Shared values for hover state
    const isHovering = useSharedValue(false);
    const cursorX = useSharedValue(0);
    const cursorY = useSharedValue(0);
    const tooltipPosition = useSharedValue({x: 0, y: 0});

    /** Data index of the slice under the cursor or the last touch tap, resolved on the UI thread together with the tooltip position */
    const matchedIndex = useSharedValue(-1);
    const isTooltipActive = useDerivedValue(() => matchedIndex.get() >= 0);

    const canvasHeight = CHART_CONTENT_MIN_HEIGHT;

    // Side by side when the legend keeps at least its minimum width next to a square donut. Otherwise stacked.
    const isLegendSideBySide = shouldUseResponsiveLegend && shouldShowLegend && chartWidth - canvasHeight - VictoryTheme.pie.legendGap >= VictoryTheme.pie.legendMinWidth;
    const donutWidth = isLegendSideBySide ? canvasHeight : chartWidth;

    const radius = Math.min(donutWidth, canvasHeight) / 2;
    const innerRadius = radius * VictoryTheme.pie.innerRadiusRatio;
    const pieGeometry = {radius, innerRadius, centerX: donutWidth / 2, centerY: canvasHeight / 2};

    // Slices are sorted by absolute value (largest first) for color assignment,
    // so slice indices don't match the original data array. We map back via
    // originalIndex so the tooltip can display the original (possibly negative) value.
    const [{key: primarySeriesKey}] = series;
    const processedSlices = processDataIntoSlices(data, primarySeriesKey, pieGeometry);

    const {formatValue} = useChartLabelFormats({data, unit: valueUnit, unitPosition: valueUnitPosition});

    /** Data index of the slice at the given point, or -1 when the point is outside the slices */
    const findDataIndexAt = (x: number, y: number) => {
        'worklet';

        const {centerX, centerY} = pieGeometry;
        const sliceIndex = findSliceAtPosition(x, y, centerX, centerY, radius, innerRadius, processedSlices);
        return sliceIndex >= 0 ? (processedSlices.at(sliceIndex)?.originalIndex ?? -1) : -1;
    };

    const hoverAt = (x: number, y: number) => {
        'worklet';

        cursorX.set(x);
        cursorY.set(y);
        tooltipPosition.set({x, y: y - TOOLTIP_BAR_GAP});
        const dataIndex = findDataIndexAt(x, y);
        const wasOverPie = matchedIndex.get() >= 0;
        matchedIndex.set(dataIndex);
        if (wasOverPie !== dataIndex >= 0) {
            scheduleOnRN(setIsHoveringOverPie, dataIndex >= 0);
        }
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

    /** The page scrolling moves the pie under a still cursor without any hover event, so the hovered slice is checked again at the cursor's new position */
    const handleChartMoved = (deltaX: number, deltaY: number) => {
        'worklet';

        if (!isHovering.get()) {
            return;
        }
        hoverAt(cursorX.get() - deltaX, cursorY.get() - deltaY);
    };

    const onChartMoved = (deltaX: number, deltaY: number) => scheduleOnUI(handleChartMoved, deltaX, deltaY);

    const {setIsTouchPinned, onTooltipDismiss, onTapFinalize, onChartTouchStart} = useTouchPinnedTooltip(() => {
        matchedIndex.set(-1);
        setIsHoveringOverPie(false);
    });

    // Hover gesture
    const hoverGesture = useHoverGesture({
        // @ts-expect-error -- touchAction is internal in Gesture Handler 3 config types, see CHART_GESTURE_TOUCH_ACTION
        touchAction: CHART_GESTURE_TOUCH_ACTION,
        onBegin: (e) => {
            'worklet';

            if (e.pointerType === PointerType.TOUCH) {
                return;
            }
            isHovering.set(true);
            scheduleOnRN(setIsTouchPinned, false);
            hoverAt(e.x, e.y);
        },
        onUpdate: (e) => {
            'worklet';

            if (e.pointerType === PointerType.TOUCH) {
                return;
            }
            hoverAt(e.x, e.y);
        },
        onDeactivate: (e) => {
            'worklet';

            if (e.pointerType === PointerType.TOUCH) {
                return;
            }
            isHovering.set(false);
            matchedIndex.set(-1);
            scheduleOnRN(setIsHoveringOverPie, false);
        },
    });

    // Tap gesture for click/tap navigation
    const tapGesture = useTapGesture({
        // @ts-expect-error -- touchAction is internal in Gesture Handler 3 config types, see CHART_GESTURE_TOUCH_ACTION
        touchAction: CHART_GESTURE_TOUCH_ACTION,
        onFinalize: onTapFinalize,
        onDeactivate: (e) => {
            'worklet';

            // Touch taps show the slice tooltip instead of drilling in, and the next touch anywhere on the screen hides it
            if (e.pointerType === PointerType.TOUCH) {
                hoverAt(e.x, e.y);
                scheduleOnRN(setIsTouchPinned, matchedIndex.get() >= 0);
                return;
            }

            const {centerX, centerY} = pieGeometry;
            const sliceIndex = findSliceAtPosition(e.x, e.y, centerX, centerY, radius, innerRadius, processedSlices);

            if (sliceIndex >= 0) {
                scheduleOnRN(handleSlicePress, sliceIndex);
            }
        },
    });

    // Combined gestures - Race allows both hover and tap to work independently
    const combinedGesture = useCompetingGestures(hoverGesture, tapGesture);

    const highlightSlice = (slice: PieSlice) => {
        tooltipPosition.set(slice.tooltipPosition);
        matchedIndex.set(slice.originalIndex);
    };
    const clearSliceHighlight = () => {
        matchedIndex.set(-1);
    };

    // One legend entry: a color dot plus the slice name, wired to drive the tooltip on hover.
    // The responsive variant gives each slice its own row with the dot aligned to the first line. The default variant is an inline item for the wrapping row below the donut.
    const renderLegendEntry = (slice: PieSlice, isResponsiveRow: boolean) => {
        const dot = <View style={[styles.pieChartLegendDot, StyleUtils.getBackgroundColorStyle(slice.color)]} />;
        return (
            <View
                key={`legend-${slice.originalIndex}`}
                style={isResponsiveRow ? styles.pieChartLegendRow : [styles.flexRow, styles.alignItemsCenter]}
                onMouseEnter={() => highlightSlice(slice)}
                onMouseLeave={clearSliceHighlight}
            >
                {isResponsiveRow ? <View style={styles.pieChartLegendDotColumn}>{dot}</View> : dot}
                <Text style={[styles.textNormal, StyleUtils.getColorStyle(theme.icon), isResponsiveRow ? styles.flex1 : styles.ml2]}>{slice.label}</Text>
            </View>
        );
    };

    const donut = (
        <GestureDetector
            gesture={combinedGesture}
            touchAction="pan-y"
        >
            <Animated.View
                style={[styles.chartContent, shouldUseResponsiveLegend && StyleUtils.getWidthStyle(donutWidth), isHoveringOverPie && styles.cursorPointer]}
                onTouchStart={onChartTouchStart}
            >
                {processedSlices.length > 0 && (
                    <PolarChart
                        explicitSize={{width: donutWidth, height: canvasHeight}}
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
                            {formatValue(data.reduce((sum, point) => sum + getPrimaryValue(point, primarySeriesKey), 0))}
                        </Text>
                    </View>
                )}

                {/* Tooltip */}
                <ChartTooltipLayer
                    matchedIndex={matchedIndex}
                    isTooltipActive={isTooltipActive}
                    data={data}
                    series={series}
                    formatValue={formatValue}
                    chartWidth={donutWidth}
                    initialTooltipPosition={tooltipPosition}
                    onChartMoved={onChartMoved}
                    onDismiss={onTooltipDismiss}
                />
            </Animated.View>
        </GestureDetector>
    );

    if (shouldUseResponsiveLegend) {
        return (
            <View style={isLegendSideBySide ? styles.pieChartResponsiveRow : styles.pieChartResponsiveColumn}>
                {donut}
                {shouldShowLegend && (
                    <View style={isLegendSideBySide ? styles.pieChartLegendSide : styles.pieChartLegendBelow}>{processedSlices.map((slice) => renderLegendEntry(slice, true))}</View>
                )}
            </View>
        );
    }

    return (
        <>
            {donut}
            {shouldShowLegend && <View style={styles.pieChartLegendContainer}>{processedSlices.map((slice) => renderLegendEntry(slice, false))}</View>}
        </>
    );
}

function PieChartContent({isLoading = false, chartWidth, ...canvasProps}: PieChartContentProps) {
    const styles = useThemeStyles();

    if (!isLoading && canvasProps.data.length === 0) {
        return null;
    }

    if (isLoading || chartWidth === null) {
        return (
            <View style={styles.chartActivityIndicator}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <PieChartCanvas
            {...canvasProps}
            chartWidth={chartWidth}
        />
    );
}

export default PieChartContent;
export type {PieChartProps};
