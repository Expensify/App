import ActivityIndicator from '@components/ActivityIndicator';
import BAR_INNER_PADDING, {MAX_HORIZONTAL_CHART_HEIGHT, MIN_BAR_ROW_HEIGHT} from '@components/Charts/barChartConstants';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs} from '@components/Charts/hooks';
import {
    ChartFontsProvider,
    useChartFontManager,
    useChartInteractions,
    useChartLabelFormats,
    useChartLabelLayout,
    useChartLabelMeasurements,
    useDynamicYDomain,
    useLabelHitTesting,
} from '@components/Charts/hooks';
import {
    estimateVerticalBarChartGeometry,
    getCategoryLabelWidth,
    getFontLineMetrics,
    getYAxisLabelWidth,
    measureTextWidth,
    truncateCategoryLabels,
    VERTICAL_BAR_BASE_DOMAIN_PADDING,
} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING} from '@components/Charts/VictoryTheme';
import ScrollView from '@components/ScrollView';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';

import React, {useState} from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {Bar, BarGroup, CartesianChart} from 'victory-native';

import type {CartesianChartProps, ChartDataPoint} from '..';

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop) */
const BASE_DOMAIN_PADDING = VERTICAL_BAR_BASE_DOMAIN_PADDING;
const HORIZONTAL_DOMAIN_PADDING = {top: 24, bottom: 24, right: 24, left: 0};
const VALUE_AXIS_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

type BarChartProps = CartesianChartProps & {
    /** Callback when a bar is pressed */
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** When true, all bars use the same color. When false (default), each bar uses a different color from the palette. */
    useSingleColor?: boolean;
};

function BarChartContentBody({data, isLoading, yAxisUnit, yAxisUnitPosition = 'left', useSingleColor = false, onBarPress}: BarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontManager = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);
    const defaultBarColor = VictoryTheme.colors.default;

    const verticalChartData = data.map((point, index) => ({
        x: index,
        y: point.total,
    }));

    const horizontalChartData = data.map((point, index) => ({
        x: point.total,
        y: data.length - 1 - index,
    }));

    const categoryIndices = data.map((_, index) => index);
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

    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const orientationGeometry = estimateVerticalBarChartGeometry(chartWidth, data, fontManager, variables.iconSizeExtraSmall, formatValue, BAR_INNER_PADDING, BASE_DOMAIN_PADDING);
    const {barAreaWidth: orientationBarAreaWidth, boundsLeft: orientationBoundsLeft, boundsRight: orientationBoundsRight, domainPadding} = orientationGeometry;

    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = orientationBarAreaWidth > 0 ? orientationBarAreaWidth / (orientationBarAreaWidth + totalDomainPadding) : 0;

    const originalLabels = data.map((p) => p.label);
    const measurements = useChartLabelMeasurements(data, fontManager, variables.iconSizeExtraSmall);

    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth, shouldUseHorizontalBars} =
        useChartLabelLayout({
            data,
            fontManager,
            fontSize: variables.iconSizeExtraSmall,
            tickSpacing: orientationBarAreaWidth > 0 ? orientationBarAreaWidth / data.length : 0,
            labelAreaWidth: orientationBarAreaWidth,
            firstTickLeftSpace: orientationBoundsLeft + domainPadding.left * paddingScale,
            lastTickRightSpace: chartWidth > 0 ? chartWidth - orientationBoundsRight + domainPadding.right * paddingScale : 0,
            measurements,
            preferHorizontalBars: true,
        });

    const isHorizontalLayout = shouldUseHorizontalBars;
    const truncatedCategoryLabels = truncateCategoryLabels(originalLabels, measurements.labelWidths, measurements.ellipsisWidth);

    const verticalBarWidth = useSharedValue(0);
    const barHeight = useSharedValue(0);
    const chartBottom = useSharedValue(0);
    const yZero = useSharedValue(0);
    const xZero = useSharedValue(0);

    const {isCursorOverLabel, findLabelCursorX, updateTickPositions} = useLabelHitTesting({
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        truncatedLabelWidths,
        labelRotation,
        labelSkipInterval,
        chartBottom,
    });

    const handleVerticalChartBoundsChange = (bounds: ChartBounds) => {
        const domainWidth = bounds.right - bounds.left;
        const calculatedBarWidth = ((1 - BAR_INNER_PADDING) * domainWidth) / data.length;
        verticalBarWidth.set(calculatedBarWidth);
        yZero.set(0);
    };

    const handleHorizontalChartBoundsChange = (bounds: ChartBounds) => {
        const domainHeight = bounds.bottom - bounds.top;
        const plotHeight = domainHeight - HORIZONTAL_DOMAIN_PADDING.top - HORIZONTAL_DOMAIN_PADDING.bottom;
        const slotHeight = data.length > 1 ? plotHeight / (data.length - 1) : plotHeight;
        const calculatedBarHeight = (1 - BAR_INNER_PADDING) * slotHeight;
        barHeight.set(calculatedBarHeight);
    };

    const checkIsOverVerticalBar = (args: HitTestArgs) => {
        'worklet';

        const currentBarWidth = verticalBarWidth.get();
        const currentYZero = yZero.get();
        if (currentBarWidth === 0) {
            return false;
        }
        const barLeft = args.targetX - currentBarWidth / 2;
        const barRight = args.targetX + currentBarWidth / 2;
        const barTop = Math.min(args.targetY, currentYZero);
        const barBottomY = Math.max(args.targetY, currentYZero);

        return args.cursorX >= barLeft && args.cursorX <= barRight && args.cursorY >= barTop && args.cursorY <= barBottomY;
    };

    const checkIsOverHorizontalBar = (args: HitTestArgs) => {
        'worklet';

        const currentBarHeight = barHeight.get();
        const currentXZero = xZero.get();
        if (currentBarHeight === 0) {
            return false;
        }

        const barLeft = Math.min(args.targetX, currentXZero);
        const barRight = Math.max(args.targetX, currentXZero);
        const barTop = args.targetY - currentBarHeight / 2;
        const barBottomY = args.targetY + currentBarHeight / 2;

        return args.cursorX >= barLeft && args.cursorX <= barRight && args.cursorY >= barTop && args.cursorY <= barBottomY;
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition, tooltipPlacement} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: isHorizontalLayout ? checkIsOverHorizontalBar : checkIsOverVerticalBar,
        ...(isHorizontalLayout
            ? {
                  nearestPointAxis: 'y' as const,
                  tooltipPlacement: 'right' as const,
                  xZero,
              }
            : {
                  isCursorOverLabel,
                  resolveLabelTouchX: findLabelCursorX,
                  chartBottom,
                  yZero,
              }),
    });

    const handleVerticalScaleChange = (xScale: Scale, yScale: Scale) => {
        yZero.set(yScale(0));
        updateTickPositions(xScale, data.length);
        setPointPositions(
            verticalChartData.map((point) => xScale(point.x)),
            verticalChartData.map((point) => yScale(point.y)),
        );
    };

    const handleHorizontalScaleChange = (xScale: Scale, yScale: Scale) => {
        xZero.set(xScale(0));
        setPointPositions(
            horizontalChartData.map((point) => xScale(point.x)),
            horizontalChartData.map((point) => yScale(point.y)),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderHorizontalBar = (point: PointsArray[number], chartBounds: ChartBounds, barCount: number, dataIndex: number) => {
        const barColor = useSingleColor ? defaultBarColor : VictoryTheme.colors.getColor(dataIndex);

        return (
            <Bar
                key={`horizontal-bar-${data.at(dataIndex)?.label ?? dataIndex}`}
                points={[point]}
                chartBounds={chartBounds}
                color={barColor}
                barCount={barCount}
                innerPadding={BAR_INNER_PADDING}
                roundedCorners={{
                    topLeft: 8,
                    topRight: 8,
                    bottomLeft: 8,
                    bottomRight: 8,
                }}
            />
        );
    };

    const renderVerticalBar = (point: PointsArray[number], chartBounds: ChartBounds, barCount: number) => {
        const dataIndex = point.xValue as number;
        const dataPoint = data.at(dataIndex);
        const barColor = useSingleColor ? defaultBarColor : VictoryTheme.colors.getColor(dataIndex);

        return (
            <Bar
                key={`bar-${dataPoint?.label}`}
                points={[point]}
                chartBounds={chartBounds}
                color={barColor}
                barCount={barCount}
                innerPadding={BAR_INNER_PADDING}
                roundedCorners={{
                    topLeft: 8,
                    topRight: 8,
                    bottomLeft: 8,
                    bottomRight: 8,
                }}
            />
        );
    };

    const renderVerticalOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        if (!fontManager || xAxisLabelHeight === undefined) {
            return null;
        }

        const chartBoundsBottom = args.yScale(Math.min(...args.yTicks));
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

    const renderHorizontalOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        if (!fontManager) {
            return null;
        }

        const valueLabels = args.xTicks.map(formatValue);
        const valueLabelWidths = valueLabels.map((label) => measureTextWidth(label, fontManager, variables.iconSizeExtraSmall));

        return (
            <>
                <ChartYAxisLabels
                    yTicks={categoryIndices}
                    labels={[...truncatedCategoryLabels].reverse()}
                    yScale={args.yScale}
                    chartBounds={args.chartBounds}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.textSupporting}
                />
                <ChartXAxisLabels
                    labels={valueLabels}
                    labelWidths={valueLabelWidths}
                    regularLabelMaxWidth={Infinity}
                    firstLabelMaxWidth={Infinity}
                    lastLabelMaxWidth={Infinity}
                    ellipsisWidth={ellipsisWidth}
                    labelRotation={0}
                    labelSkipInterval={1}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.textSupporting}
                    xScale={(index) => args.xScale(args.xTicks.at(index) ?? 0)}
                    chartBoundsBottom={args.chartBounds.bottom}
                />
            </>
        );
    };

    const verticalLabelSpace = VictoryTheme.axis.labelGap + (xAxisLabelHeight ?? 0);
    const verticalChartStyle = {
        height: CHART_CONTENT_MIN_HEIGHT + verticalLabelSpace,
    };
    const verticalYAxisLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, BASE_DOMAIN_PADDING);
    const verticalChartPadding = {
        ...VictoryTheme.axis.padding,
        bottom: verticalLabelSpace + VictoryTheme.axis.padding.bottom,
        left: verticalYAxisLabelWidth + GLYPH_PADDING,
    };

    const horizontalCategoryLabelWidth = getCategoryLabelWidth(truncatedCategoryLabels, fontManager, variables.iconSizeExtraSmall);
    const horizontalValueLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, VALUE_AXIS_DOMAIN_PADDING);
    const {ascent, descent} = fontManager ? getFontLineMetrics(fontManager, variables.iconSizeExtraSmall) : {ascent: 0, descent: 0};
    const horizontalXAxisLabelHeight = ascent + descent + VictoryTheme.axis.labelGap;
    const horizontalContentHeight = Math.max(
        CHART_CONTENT_MIN_HEIGHT,
        data.length * MIN_BAR_ROW_HEIGHT + VictoryTheme.axis.padding.top + VictoryTheme.axis.padding.bottom + horizontalXAxisLabelHeight,
    );
    const needsHorizontalScroll = horizontalContentHeight > MAX_HORIZONTAL_CHART_HEIGHT;
    const horizontalChartPadding = {
        ...VictoryTheme.axis.padding,
        left: horizontalCategoryLabelWidth + GLYPH_PADDING,
        bottom: horizontalXAxisLabelHeight + VictoryTheme.axis.padding.bottom,
        right: horizontalValueLabelWidth + GLYPH_PADDING,
    };
    const horizontalChartStyle = {height: horizontalContentHeight};

    if (isLoading || !fontManager) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'BarChartContent',
            isLoading,
            isFontLoading: !fontManager,
        };
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

    const chartLayoutStyle = isHorizontalLayout ? horizontalChartStyle : verticalChartStyle;

    const chartBody = (
        <GestureDetector gesture={customGestures}>
            <Animated.View style={[chartLayoutStyle, cursorStyle]}>
                {chartWidth > 0 &&
                    (isHorizontalLayout ? (
                        <CartesianChart
                            xKey="x"
                            yKeys={['y']}
                            padding={horizontalChartPadding}
                            domain={{
                                y: [0, Math.max(1, data.length - 1)],
                                ...(yAxisDomain ? {x: yAxisDomain} : {}),
                            }}
                            domainPadding={HORIZONTAL_DOMAIN_PADDING}
                            onChartBoundsChange={handleHorizontalChartBoundsChange}
                            onScaleChange={handleHorizontalScaleChange}
                            renderOutside={renderHorizontalOutside}
                            xAxis={{
                                tickCount: VictoryTheme.axis.tickCount,
                                lineWidth: VictoryTheme.axis.yLineWidth,
                                lineColor: theme.border,
                                labelOffset: VictoryTheme.axis.labelGap,
                            }}
                            yAxis={[
                                {
                                    tickCount: 0,
                                    lineWidth: VictoryTheme.axis.xLineWidth,
                                },
                            ]}
                            frame={{lineWidth: 0}}
                            data={horizontalChartData}
                        >
                            {({points, chartBounds}) =>
                                useSingleColor ? (
                                    <BarGroup
                                        chartBounds={chartBounds}
                                        withinGroupPadding={BAR_INNER_PADDING}
                                        isHorizontal
                                        roundedCorners={{topRight: 8, bottomRight: 8}}
                                    >
                                        {[
                                            <BarGroup.Bar
                                                key="horizontal-bars-single-color"
                                                points={points.y}
                                                color={defaultBarColor}
                                            />,
                                        ]}
                                    </BarGroup>
                                ) : (
                                    points.y.map((point, index) => renderHorizontalBar(point, chartBounds, points.y.length, index))
                                )
                            }
                        </CartesianChart>
                    ) : (
                        <CartesianChart
                            xKey="x"
                            padding={verticalChartPadding}
                            yKeys={['y']}
                            domainPadding={domainPadding}
                            onChartBoundsChange={handleVerticalChartBoundsChange}
                            onScaleChange={handleVerticalScaleChange}
                            renderOutside={renderVerticalOutside}
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
                            data={verticalChartData}
                        >
                            {({points, chartBounds}) => points.y.map((point) => renderVerticalBar(point, chartBounds, points.y.length))}
                        </CartesianChart>
                    ))}
                <ChartTooltipLayer
                    matchedIndex={matchedIndex}
                    isTooltipActive={isTooltipActive}
                    data={data}
                    formatValue={formatValue}
                    chartWidth={chartWidth}
                    initialTooltipPosition={initialTooltipPosition}
                    {...(isHorizontalLayout ? {placement: tooltipPlacement} : {})}
                />
            </Animated.View>
        </GestureDetector>
    );

    const measuredChart = (
        <View
            onLayout={handleLayout}
            collapsable={false}
        >
            {chartBody}
        </View>
    );

    if (isHorizontalLayout && needsHorizontalScroll) {
        return (
            <ScrollView
                style={styles.chartHorizontalScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
            >
                {measuredChart}
            </ScrollView>
        );
    }

    return measuredChart;
}

function BarChartContent(props: BarChartProps) {
    return (
        <ChartFontsProvider>
            <BarChartContentBody {...props} />
        </ChartFontsProvider>
    );
}

export default BarChartContent;
export type {BarChartProps};
