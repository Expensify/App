import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs, useChartLabelLayout} from '@components/Charts/hooks';
import {useChartInteractions, useLabelHitTesting} from '@components/Charts/hooks';
import {getYAxisLabelWidth} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING} from '@components/Charts/VictoryTheme';

import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';

import React from 'react';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {Bar, CartesianChart} from 'victory-native';

import type {ChartDataPoint} from '..';

type VerticalBarChartProps = {
    /** Chart data points to render as vertical bars */
    data: ChartDataPoint[];

    /** Measured width of the chart container */
    chartWidth: number;

    /** Layout callback that reports the chart container's measured width */
    onLayout: (event: LayoutChangeEvent) => void;

    /** Font manager for Paragraph API rendering with multi-font fallback */
    fontManager: SkTypefaceFontProvider;

    /** Formats a numeric value for display */
    formatValue: (value: number) => string;

    /** Y-axis domain override (e.g. anchored at zero) */
    yAxisDomain: [number] | undefined;

    /** When true, all bars use the same color. When false, each bar uses a different color from the palette. */
    useSingleColor: boolean;

    /** Callback when a bar is pressed, given its data index */
    onBarPress: (index: number) => void;

    /** Result of useChartLabelLayout, computed by the parent since it also drives the orientation decision */
    labelLayout: ReturnType<typeof useChartLabelLayout>;

    /** Original (non-truncated) label strings from the data */
    originalLabels: string[];

    /** Pre-measured pixel width of each original label */
    labelWidths: number[];

    /** Extra pixel spacing between the chart boundary and the data range, applied per side */
    domainPadding: {top: number; bottom: number; left: number; right: number};
};

/**
 * Renders bar chart data as vertical bars with x-axis category labels (optionally rotated/truncated)
 * and y-axis value labels. Used when labels fit at 0°, 45°, or 90° rotation.
 */
function VerticalBarChart({
    data,
    chartWidth,
    onLayout,
    fontManager,
    formatValue,
    yAxisDomain,
    useSingleColor,
    onBarPress,
    labelLayout,
    originalLabels,
    labelWidths,
    domainPadding,
}: VerticalBarChartProps) {
    const theme = useTheme();
    const defaultBarColor = VictoryTheme.colors.default;
    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth} = labelLayout;

    const verticalChartData = data.map((point, index) => ({
        x: index,
        y: point.total,
    }));

    const verticalBarWidth = useSharedValue(0);
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

    const handleVerticalChartBoundsChange = (bounds: ChartBounds) => {
        const domainWidth = bounds.right - bounds.left;
        const calculatedBarWidth = ((1 - BAR_INNER_PADDING) * domainWidth) / data.length;
        verticalBarWidth.set(calculatedBarWidth);
        yZero.set(0);
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

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: onBarPress,
        checkIsOver: checkIsOverVerticalBar,
        isCursorOverLabel,
        resolveLabelTouchX: findLabelCursorX,
        chartBottom,
        yZero,
    });

    const handleVerticalScaleChange = (xScale: Scale, yScale: Scale) => {
        yZero.set(yScale(0));
        updateTickPositions(xScale, data.length);
        setPointPositions(
            verticalChartData.map((point) => xScale(point.x)),
            verticalChartData.map((point) => yScale(point.y)),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderVerticalBar = (point: PointsArray[number], chartBounds: ChartBounds, barCount: number) => {
        const dataIndex = Number(point.xValue);
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
        if (xAxisLabelHeight === undefined) {
            return null;
        }

        const chartBoundsBottom = args.yScale(Math.min(...args.yTicks));
        chartBottom.set(chartBoundsBottom);

        return (
            <>
                <ChartXAxisLabels
                    labels={originalLabels}
                    labelWidths={labelWidths}
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

    const verticalLabelSpace = VictoryTheme.axis.labelGap + (xAxisLabelHeight ?? 0);
    const verticalChartStyle = {
        height: CHART_CONTENT_MIN_HEIGHT + verticalLabelSpace,
    };

    const verticalYAxisLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, domainPadding);
    const verticalChartPadding = {
        ...VictoryTheme.axis.padding,
        bottom: verticalLabelSpace + VictoryTheme.axis.padding.bottom,
        left: verticalYAxisLabelWidth + GLYPH_PADDING,
    };

    return (
        <GestureDetector gesture={customGestures}>
            <Animated.View
                style={[verticalChartStyle, cursorStyle]}
                onLayout={onLayout}
            >
                {chartWidth > 0 && (
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
                            // Labels are rendered ourselves via `renderOutside`/ChartXAxisLabels (no `font` is passed here),
                            // and `verticalChartPadding.bottom` already reserves the exact space they need. Victory-native's
                            // default "outset" position additionally reserves its own space for a built-in x-axis label,
                            // which would double-count the reservation and create unwanted blank space below the chart.
                            labelPosition: 'inset',
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
                )}
                <ChartTooltipLayer
                    matchedIndex={matchedIndex}
                    isTooltipActive={isTooltipActive}
                    data={data}
                    formatValue={formatValue}
                    chartWidth={chartWidth}
                    initialTooltipPosition={initialTooltipPosition}
                />
            </Animated.View>
        </GestureDetector>
    );
}

export default VerticalBarChart;
export type {VerticalBarChartProps};
