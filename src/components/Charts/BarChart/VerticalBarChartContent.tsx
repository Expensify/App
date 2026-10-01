import ActivityIndicator from '@components/ActivityIndicator';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import ChartLegend from '@components/Charts/components/ChartLegend';
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
import {calculateMinDomainPadding, getPointValues, getSeriesValue, getXAxisLabel, getYAxisLabelWidth} from '@components/Charts/utils';
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
import {Bar, BarGroup, CartesianChart} from 'victory-native';

import type {BarChartProps} from './types';

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop)
 * We need bottom: 1 for proper display of the bottom label
 */
const BASE_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

/** Gap between the bars of one group, as a share of a bar's width */
const BAR_WITHIN_GROUP_PADDING = 0.1;

/** Corner radius (px) applied to the ends of a bar */
const BAR_CORNER_RADIUS = 8;

/** A lone bar is rounded at both ends; grouped bars are rounded only on the end carrying the value. */
const BAR_ROUNDED_CORNERS = {topLeft: BAR_CORNER_RADIUS, topRight: BAR_CORNER_RADIUS, bottomLeft: BAR_CORNER_RADIUS, bottomRight: BAR_CORNER_RADIUS};

/** victory-native flips these for a bar that hangs below the axis, so the flat end always meets the axis. */
const GROUPED_BAR_ROUNDED_CORNERS = {topLeft: BAR_CORNER_RADIUS, topRight: BAR_CORNER_RADIUS, bottomLeft: 0, bottomRight: 0};

/** A point as victory-native reads it: the x index plus one entry per series, keyed by the series' key. */
type VerticalBarChartDatum = Record<string, number>;

function VerticalBarChartContentBody({data, series, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onBarPress}: BarChartProps) {
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

    /** Width of the whole group of bars at one x position, as BarGroup lays it out */
    const groupWidth = useSharedValue(0);

    /** Canvas x position of each group's center, so a press can be traced back to the bar under the cursor */
    const groupCenters = useSharedValue<number[]>([]);

    /** Canvas y position of each bar's top, per group and then per series */
    const barTops = useSharedValue<number[][]>([]);
    const yZero = useSharedValue(0);

    /** Index of the group's series whose bar is under the cursor, or -1 when the cursor misses every bar */
    const getSeriesIndexAt = (index: number, cursorX: number, cursorY: number): number => {
        'worklet';

        const groupCenter = groupCenters.get().at(index);
        const currentGroupWidth = groupWidth.get();
        if (groupCenter === undefined || currentGroupWidth === 0) {
            return -1;
        }
        const offset = cursorX - (groupCenter - currentGroupWidth / 2);
        if (offset < 0 || offset > currentGroupWidth) {
            return -1;
        }
        const seriesIndex = Math.min(seriesKeys.length - 1, Math.floor(offset / (currentGroupWidth / seriesKeys.length)));
        const currentYZero = yZero.get();
        const barTop = barTops.get().at(index)?.at(seriesIndex) ?? currentYZero;
        return cursorY >= Math.min(barTop, currentYZero) && cursorY <= Math.max(barTop, currentYZero) ? seriesIndex : -1;
    };

    const handleBarPress = (index: number, cursor: {x: number; y: number}) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onBarPress) {
            onBarPress(dataPoint, index, seriesKeys.at(getSeriesIndexAt(index, cursor.x, cursor.y)) ?? primarySeriesKey);
        }
    };

    const handleBarSizeChange = (sizes: {groupWidth: number}) => {
        groupWidth.set(sizes.groupWidth);
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

    const originalLabels = data.map(getXAxisLabel);

    const measurements = useChartLabelMeasurements(data, fontManager, variables.iconSizeExtraSmall);

    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth} = useChartLabelLayout({
        data,
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        tickSpacing: barAreaWidth > 0 ? barAreaWidth / data.length : 0,
        labelAreaWidth: barAreaWidth,
        firstTickLeftSpace: boundsLeft + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - boundsRight + domainPadding.right * paddingScale : 0,
        measurements,
    });

    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const chartBottom = useSharedValue(0);

    const {isCursorOverLabel, findLabelCursorX, updateTickPositions} = useLabelHitTesting({
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        truncatedLabelWidths,
        labelRotation,
        labelSkipInterval,
        chartBottom,
    });

    // BarGroup reports the real widths once it has laid out; until then the group's share of the plot is the same figure.
    const handleChartBoundsChange = (bounds: ChartBounds) => {
        const domainWidth = bounds.right - bounds.left;
        const calculatedGroupWidth = ((1 - BAR_INNER_PADDING) * domainWidth) / data.length;
        groupWidth.set(calculatedGroupWidth);
        yZero.set(0);
        setBarAreaWidth(domainWidth);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
    };

    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        return getSeriesIndexAt(args.targetIndex, args.cursorX, args.cursorY) >= 0;
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: checkIsOverBar,
        isCursorOverLabel,
        resolveLabelTouchX: findLabelCursorX,
        chartBottom,
        yZero,
    });

    /** Records where every data point sits on the canvas, which hover, press and the tooltip read */
    const updateHitPositions = (xScale: Scale, yScale: Scale) => {
        yZero.set(yScale(0));
        updateTickPositions(xScale, data.length);
        const centers = chartData.map((point, index) => xScale(point.x ?? index));
        groupCenters.set(centers);
        barTops.set(data.map((point) => seriesKeys.map((key) => yScale(getSeriesValue(point, key)))));
        setPointPositions(
            centers,
            // The tooltip sits above the tallest bar of the group, so it clears every series.
            data.map((point) => Math.min(...seriesKeys.map((key) => yScale(getSeriesValue(point, key))))),
        );
    };

    const handleScaleChange = useScaleChangeHandler(updateHitPositions, data, series);

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderBar = (point: PointsArray[number], chartBounds: ChartBounds, barCount: number) => {
        const dataIndex = Number(point.xValue);
        const dataPoint = data.at(dataIndex);
        const barColor = series.at(0)?.color ?? VictoryTheme.colors.getColor(dataIndex);

        return (
            <Bar
                key={`bar-${dataPoint?.label}`}
                points={[point]}
                chartBounds={chartBounds}
                color={barColor}
                barCount={barCount}
                innerPadding={BAR_INNER_PADDING}
                roundedCorners={BAR_ROUNDED_CORNERS}
            />
        );
    };

    const renderOutside = (args: CartesianChartRenderArg<VerticalBarChartDatum, string>) => {
        if (!fontManager || xAxisLabelHeight === undefined) {
            return null;
        }

        // The lowest tick is not always the bottom of the plot, and anything drawn below it would cover the labels.
        const chartBoundsBottom = args.yScale(Math.min(0, ...args.yTicks, ...data.flatMap(getPointValues)));
        chartBottom.set(chartBoundsBottom);

        return (
            <>
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
                    labelColor={theme.textSupporting}
                    xScale={args.xScale}
                    chartBoundsBottom={chartBoundsBottom}
                />
                <ChartYAxisLabels
                    yTicks={args.yTicks}
                    yScale={args.yScale}
                    chartBounds={args.chartBounds}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.textSupporting}
                    formatValue={formatValue}
                    leftAlign
                />
            </>
        );
    };

    const labelSpace = VictoryTheme.axis.labelGap + (xAxisLabelHeight ?? 0);
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const yAxisLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, BASE_DOMAIN_PADDING);
    const chartPadding = {...VictoryTheme.axis.padding, bottom: labelSpace + VictoryTheme.axis.padding.bottom, left: yAxisLabelWidth + GLYPH_PADDING};

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
        <>
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
                            domainPadding={domainPadding}
                            onChartBoundsChange={handleChartBoundsChange}
                            onScaleChange={handleScaleChange}
                            renderOutside={renderOutside}
                            xAxis={{
                                tickCount: data.length,
                                lineWidth: VictoryTheme.axis.xLineWidth,
                            }}
                            yAxis={[
                                {
                                    tickCount: VictoryTheme.axis.tickCount,
                                    lineWidth: VictoryTheme.axis.yLineWidth,
                                    lineColor: theme.border,
                                    labelOffset: VictoryTheme.axis.labelGap,
                                    domain: yAxisDomain,
                                },
                            ]}
                            frame={{lineWidth: 0}}
                            data={chartData}
                        >
                            {({points, chartBounds}) =>
                                series.length > 1 ? (
                                    <BarGroup
                                        chartBounds={chartBounds}
                                        betweenGroupPadding={BAR_INNER_PADDING}
                                        withinGroupPadding={BAR_WITHIN_GROUP_PADDING}
                                        roundedCorners={GROUPED_BAR_ROUNDED_CORNERS}
                                        onBarSizeChange={handleBarSizeChange}
                                    >
                                        {series.map((seriesItem) => (
                                            <BarGroup.Bar
                                                key={seriesItem.key}
                                                points={points[seriesItem.key] ?? []}
                                                color={seriesItem.color ?? VictoryTheme.colors.default}
                                            />
                                        ))}
                                    </BarGroup>
                                ) : (
                                    (points[primarySeriesKey] ?? []).map((point) => renderBar(point, chartBounds, data.length))
                                )
                            }
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
            <ChartLegend series={series} />
        </>
    );
}

export default VerticalBarChartContentBody;
