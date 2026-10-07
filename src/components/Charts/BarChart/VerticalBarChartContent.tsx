import ActivityIndicator from '@components/ActivityIndicator';
import {BAR_CORNER_RADIUS, BAR_GROUP_INNER_GAP, BAR_HIT_GAP_RATIO, VERTICAL_BAR_DOMAIN_PADDING} from '@components/Charts/barChartConstants';
import ChartGridLines from '@components/Charts/components/ChartGridLines';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs} from '@components/Charts/hooks';
import {
    useChartFontManager,
    useChartInteractions,
    useChartLabelFormats,
    useChartLabelLayout,
    useChartLabelMeasurements,
    useDynamicYDomain,
    useLabelHitTesting,
    useScaleChangeHandler,
} from '@components/Charts/hooks';
import {getBarLayout, getSeriesValue, getXAxisLabel, getYAxisLabelWidth} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING} from '@components/Charts/VictoryTheme';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';

import React, {useState} from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {Bar, CartesianChart} from 'victory-native';

import type BarChartProps from './types';

/** A lone bar is rounded at both ends; grouped bars are rounded only on the end carrying the value. */
const BAR_ROUNDED_CORNERS = {topLeft: BAR_CORNER_RADIUS, topRight: BAR_CORNER_RADIUS, bottomLeft: BAR_CORNER_RADIUS, bottomRight: BAR_CORNER_RADIUS};

/** victory-native flips these for a bar that hangs below the axis, so the flat end always meets the axis. */
const GROUPED_BAR_ROUNDED_CORNERS = {topLeft: BAR_CORNER_RADIUS, topRight: BAR_CORNER_RADIUS, bottomLeft: 0, bottomRight: 0};

/** Width of each bar when `barCount` bars share a slot `slotWidth` wide */
function getGroupedBarWidth(slotWidth: number, barCount: number): number {
    return (slotWidth - BAR_GROUP_INNER_GAP * (barCount - 1)) / barCount;
}

/** A point as victory-native reads it: the x index plus one entry per series, keyed by the series' key. */
type VerticalBarChartDatum = Record<string, number>;

function VerticalBarChartContentBody({data, series, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onBarPress, shouldShowLabels = true}: BarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontManager = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);
    const [barAreaWidth, setBarAreaWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);

    const seriesKeys = series.map((seriesItem) => seriesItem.key);
    const primarySeriesKey = seriesKeys.at(0) ?? '';
    const chartData: VerticalBarChartDatum[] = data.map((point, index) => ({
        x: index,
        ...Object.fromEntries(seriesKeys.map((key) => [key, getSeriesValue(point, key)])),
    }));

    const yAxisDomain = useDynamicYDomain(data);

    // Each slot holds one bar, or one group of bars when several series are compared.
    const barLayout = getBarLayout(barAreaWidth, data.length);
    const groupedBarWidth = getGroupedBarWidth(barLayout.barWidth, seriesKeys.length);

    const slotWidth = useSharedValue(0);
    const slotHitHalfWidth = useSharedValue(0);
    const plotTop = useSharedValue(0);
    const plotBottom = useSharedValue(0);

    /** Canvas x of each slot's center */
    const slotCenters = useSharedValue<number[]>([]);

    /** Index of the series whose bar is nearest the cursor within a slot */
    const getSeriesIndexAt = (index: number, cursorX: number): number => {
        'worklet';

        const slotCenter = slotCenters.get().at(index);
        const currentSlotWidth = slotWidth.get();
        if (slotCenter === undefined || currentSlotWidth === 0) {
            return 0;
        }
        const offset = cursorX - (slotCenter - currentSlotWidth / 2);
        return Math.max(0, Math.min(seriesKeys.length - 1, Math.floor(offset / (currentSlotWidth / seriesKeys.length))));
    };

    const handleBarPress = (index: number, cursor: {x: number; y: number}) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onBarPress) {
            onBarPress(dataPoint, index, seriesKeys.at(getSeriesIndexAt(index, cursor.x)) ?? primarySeriesKey);
        }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    // Empty label data makes the measurement and layout hooks return early instead of laying out labels nobody sees.
    const labelData = shouldShowLabels ? data : [];
    const originalLabels = labelData.map(getXAxisLabel);

    const measurements = useChartLabelMeasurements(labelData, fontManager, variables.iconSizeExtraSmall);

    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth} = useChartLabelLayout({
        data: labelData,
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        measurements,
        tickSpacing: shouldShowLabels && barAreaWidth > 0 ? barLayout.barWidth + barLayout.gap : 0,
        labelAreaWidth: barAreaWidth,
        firstTickLeftSpace: boundsLeft + barLayout.edgeSpace,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - boundsRight + barLayout.edgeSpace : 0,
    });

    const {formatValue, formatCompactValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const chartBottom = useSharedValue(0);
    const yZero = useSharedValue(0);

    const {isCursorOverLabel, findLabelCursorX, updateTickPositions} = useLabelHitTesting({
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        truncatedLabelWidths,
        labelRotation,
        labelSkipInterval,
        chartBottom,
    });

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        const domainWidth = bounds.right - bounds.left;
        const {barWidth, gap} = getBarLayout(domainWidth, data.length);
        slotWidth.set(barWidth);
        slotHitHalfWidth.set(barWidth > 0 ? barWidth / 2 + gap * BAR_HIT_GAP_RATIO : 0);
        plotTop.set(bounds.top);
        plotBottom.set(bounds.bottom);
        yZero.set(0);
        setBarAreaWidth(domainWidth);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
    };

    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        // The target spans the full plot height and the whole slot, covering every bar of a group.
        const halfWidth = slotHitHalfWidth.get();
        if (halfWidth === 0) {
            return false;
        }
        const slotCenter = slotCenters.get().at(args.targetIndex) ?? args.targetX;
        const isWithinX = Math.abs(args.cursorX - slotCenter) <= halfWidth;
        return isWithinX && args.cursorY >= plotTop.get() && args.cursorY <= plotBottom.get();
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: checkIsOverBar,
        isCursorOverLabel: shouldShowLabels ? isCursorOverLabel : undefined,
        resolveLabelTouchX: shouldShowLabels ? findLabelCursorX : undefined,
        chartBottom,
        yZero,
    });

    /** Stores canvas positions for hover, press and the tooltip */
    const updateHitPositions = (xScale: Scale, yScale: Scale) => {
        yZero.set(yScale(0));
        updateTickPositions(xScale, data.length);
        const centers = chartData.map((point, index) => xScale(point.x ?? index));
        slotCenters.set(centers);

        // The tooltip sits above the primary series' bar, which is the first bar of a group.
        const [rangeStart, rangeEnd] = xScale.range();
        const slot = getBarLayout(Math.abs(rangeEnd - rangeStart), data.length).barWidth;
        const primaryBarOffset = seriesKeys.length > 1 ? (getGroupedBarWidth(slot, seriesKeys.length) - slot) / 2 : 0;
        setPointPositions(
            centers.map((center) => center + primaryBarOffset),
            data.map((point) => yScale(getSeriesValue(point, primarySeriesKey))),
        );
    };

    const handleScaleChange = useScaleChangeHandler(updateHitPositions, data, series);

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    /** A lone series takes one palette color per item; compared series keep it and draw the other period a lighter shade. */
    const renderBar = (point: PointsArray[number], chartBounds: ChartBounds, seriesIndex: number) => {
        const dataIndex = Number(point.xValue);
        const dataPoint = data.at(dataIndex);
        const color = seriesIndex === 0 ? VictoryTheme.colors.getColor(dataIndex) : VictoryTheme.colors.getComparisonColor(VictoryTheme.colors.getColor(dataIndex), theme.colorScheme);

        if (series.length === 1) {
            return (
                <Bar
                    key={`bar-${dataPoint?.label}`}
                    points={[point]}
                    chartBounds={chartBounds}
                    color={color}
                    barWidth={barLayout.barWidth}
                    barCount={data.length}
                    roundedCorners={BAR_ROUNDED_CORNERS}
                />
            );
        }

        // Each bar of a group is shifted from the slot's center to its own place within the slot.
        const offset = -barLayout.barWidth / 2 + seriesIndex * (groupedBarWidth + BAR_GROUP_INNER_GAP) + groupedBarWidth / 2;
        return (
            <Bar
                key={`bar-${seriesKeys.at(seriesIndex)}-${dataPoint?.label}`}
                points={[{...point, x: point.x + offset}]}
                chartBounds={chartBounds}
                color={color}
                barWidth={groupedBarWidth}
                barCount={data.length}
                roundedCorners={GROUPED_BAR_ROUNDED_CORNERS}
            />
        );
    };

    const renderOutside = (args: CartesianChartRenderArg<VerticalBarChartDatum, string>) => {
        if (!fontManager || xAxisLabelHeight === undefined) {
            return null;
        }

        const chartBoundsBottom = args.chartBounds.bottom;
        chartBottom.set(chartBoundsBottom);

        return (
            <>
                {shouldShowLabels && (
                    <ChartXAxisLabels
                        labels={originalLabels}
                        labelWidths={measurements.labelWidths}
                        regularLabelMaxWidth={regularLabelMaxWidth}
                        firstLabelMaxWidth={firstLabelMaxWidth}
                        lastLabelMaxWidth={lastLabelMaxWidth}
                        ellipsisWidth={ellipsisWidth}
                        labelRotation={labelRotation}
                        labelSkipInterval={labelSkipInterval}
                        fontSize={variables.iconSizeExtraSmall}
                        fontManager={fontManager}
                        labelColor={theme.icon}
                        xScale={args.xScale}
                        chartBoundsBottom={chartBoundsBottom}
                    />
                )}
                <ChartYAxisLabels
                    yTicks={args.yTicks}
                    yScale={args.yScale}
                    canvasWidth={args.canvasSize.width}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.icon}
                    formatValue={formatCompactValue}
                />
            </>
        );
    };

    const labelSpace = shouldShowLabels ? VictoryTheme.axis.xAxisLabelGap + (xAxisLabelHeight ?? 0) : 0;
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const yAxisLabelWidth = getYAxisLabelWidth(data, formatCompactValue, fontManager, variables.iconSizeExtraSmall, VERTICAL_BAR_DOMAIN_PADDING);
    const chartPadding = {...VictoryTheme.axis.padding, bottom: labelSpace + VictoryTheme.axis.padding.bottom, right: yAxisLabelWidth + GLYPH_PADDING};

    if (isLoading || !fontManager) {
        return (
            <View style={styles.chartActivityIndicator}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <GestureDetector
            gesture={customGestures}
            touchAction="pan-y"
        >
            <Animated.View
                style={[styles.chartContent, dynamicChartStyle, cursorStyle]}
                onLayout={handleLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        padding={chartPadding}
                        yKeys={seriesKeys}
                        domain={{x: barLayout.xDomain}}
                        domainPadding={VERTICAL_BAR_DOMAIN_PADDING}
                        onChartBoundsChange={handleChartBoundsChange}
                        onScaleChange={handleScaleChange}
                        renderOutside={renderOutside}
                        xAxis={{
                            tickCount: data.length,
                            lineWidth: VictoryTheme.axis.xLineWidth,
                            // "outset" makes victory-native reserve 2 * yAxis.labelOffset below the plot for labels it
                            // doesn't draw (we render ChartXAxisLabels ourselves), on top of our own labelSpace.
                            labelPosition: 'inset',
                        }}
                        yAxis={[
                            {
                                tickCount: VictoryTheme.axis.tickCount,
                                axisSide: 'right',
                                lineWidth: 0,
                                labelOffset: VictoryTheme.axis.labelGap,
                                domain: yAxisDomain,
                            },
                        ]}
                        frame={{lineWidth: 0}}
                        data={chartData}
                    >
                        {({points, chartBounds, yScale, yTicks}) => (
                            <>
                                <ChartGridLines
                                    yTicks={yTicks}
                                    yScale={yScale}
                                    chartBounds={chartBounds}
                                    color={theme.border}
                                />
                                {(series.length === 1 || groupedBarWidth > 0) &&
                                    series.flatMap((seriesItem, seriesIndex) => (points[seriesItem.key] ?? []).map((point) => renderBar(point, chartBounds, seriesIndex)))}
                            </>
                        )}
                    </CartesianChart>
                )}
                <ChartTooltipLayer
                    matchedIndex={matchedIndex}
                    isTooltipActive={isTooltipActive}
                    data={data}
                    series={series}
                    formatValue={formatValue}
                    chartWidth={chartWidth}
                    initialTooltipPosition={initialTooltipPosition}
                />
            </Animated.View>
        </GestureDetector>
    );
}

export default VerticalBarChartContentBody;
