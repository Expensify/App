import BAR_INNER_PADDING, {BAR_CORNER_RADIUS} from '@components/Charts/barChartConstants';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs, useChartLabelLayout} from '@components/Charts/hooks';
import {useChartInteractions, useLabelHitTesting} from '@components/Charts/hooks';
import type {ChartDataPoint} from '@components/Charts/types';
import {getBarColor, getXAxisLabel} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';

import React from 'react';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {Bar, CartesianChart} from 'victory-native';

type VerticalBarChartProps = {
    /** Chart data points, one bar per point */
    data: ChartDataPoint[];

    /** Measured width of the chart container */
    chartWidth: number;

    /** Reports the chart container's width back to the parent */
    onLayout: (event: LayoutChangeEvent) => void;

    /** Font manager for Paragraph API rendering with multi-font fallback */
    fontManager: SkTypefaceFontProvider;

    /** Formats a value-axis tick for display */
    formatValue: (value: number) => string;

    /** Value-axis domain override (e.g. anchored at zero) */
    yAxisDomain: [number] | undefined;

    /** When true, all bars use the same color. When false, each bar uses a different color from the palette. */
    useSingleColor: boolean;

    /** Called with the data index of the pressed bar */
    onBarPress: (index: number) => void;

    /** X-axis label layout, computed by the parent because it also decides the chart orientation */
    labelLayout: ReturnType<typeof useChartLabelLayout>;

    /** Pre-measured pixel width of each x-axis label */
    labelWidths: number[];

    /** Extra pixel spacing between the chart boundary and the data range, applied per side */
    domainPadding: {top: number; bottom: number; left: number; right: number};

    /** Left chart padding, reserving the gutter for the y-axis labels */
    chartPaddingLeft: number;
};

/** Renders the data as vertical bars with category labels along the x-axis (at 0° or 45°). */
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
    labelWidths,
    domainPadding,
    chartPaddingLeft,
}: VerticalBarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth} = labelLayout;

    const chartData = data.map((point, index) => ({
        x: index,
        y: point.total,
    }));

    const originalLabels = data.map(getXAxisLabel);

    const barWidth = useSharedValue(0);
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
        const calculatedBarWidth = ((1 - BAR_INNER_PADDING) * domainWidth) / data.length;
        barWidth.set(calculatedBarWidth);
        yZero.set(0);
    };

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

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: onBarPress,
        checkIsOver: checkIsOverBar,
        isCursorOverLabel,
        resolveLabelTouchX: findLabelCursorX,
        chartBottom,
        yZero,
    });

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        yZero.set(yScale(0));
        updateTickPositions(xScale, data.length);
        setPointPositions(
            chartData.map((point) => xScale(point.x)),
            chartData.map((point) => yScale(point.y)),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderBar = (point: PointsArray[number], chartBounds: ChartBounds, barCount: number) => {
        const dataIndex = Number(point.xValue);
        const dataPoint = data.at(dataIndex);

        return (
            <Bar
                key={`bar-${dataPoint?.label}`}
                points={[point]}
                chartBounds={chartBounds}
                color={getBarColor(useSingleColor, dataIndex)}
                barCount={barCount}
                innerPadding={BAR_INNER_PADDING}
                roundedCorners={{topLeft: BAR_CORNER_RADIUS, topRight: BAR_CORNER_RADIUS, bottomLeft: BAR_CORNER_RADIUS, bottomRight: BAR_CORNER_RADIUS}}
            />
        );
    };

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
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

    const labelSpace = VictoryTheme.axis.labelGap + (xAxisLabelHeight ?? 0);
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const chartPadding = {...VictoryTheme.axis.padding, bottom: labelSpace + VictoryTheme.axis.padding.bottom, left: chartPaddingLeft};

    return (
        <GestureDetector gesture={customGestures}>
            <Animated.View
                style={[styles.chartContent, dynamicChartStyle, cursorStyle]}
                onLayout={onLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        padding={chartPadding}
                        yKeys={['y']}
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
                        {({points, chartBounds}) => points.y.map((point) => renderBar(point, chartBounds, points.y.length))}
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
