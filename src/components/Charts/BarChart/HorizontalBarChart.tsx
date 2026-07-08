import BAR_INNER_PADDING, {BAR_CORNER_RADIUS, MAX_HORIZONTAL_CHART_HEIGHT, MIN_BAR_ROW_HEIGHT} from '@components/Charts/barChartConstants';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartCursorStyle, useChartInteractions} from '@components/Charts/hooks';
import {createHorizontalBarPath, getBarColor, getCategoryLabelWidth, getFontLineMetrics, getYAxisLabelWidth, measureTextWidth} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING} from '@components/Charts/VictoryTheme';
import ScrollView from '@components/ScrollView';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';

import {Path} from '@shopify/react-native-skia';
import React from 'react';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useSharedValue} from 'react-native-reanimated';
import {BarGroup, CartesianChart} from 'victory-native';

import type {ChartDataPoint} from '..';

/** Extra pixel spacing reserved around the horizontal-bar plot area, applied per side */
const HORIZONTAL_DOMAIN_PADDING = {top: 24, bottom: 24, right: 24, left: 0};

/** Domain padding used only to size the value-axis (x-axis) label width */
const VALUE_AXIS_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

type HorizontalBarChartProps = {
    /** Chart data points to render as horizontal bars */
    data: ChartDataPoint[];

    /** Measured width of the chart container */
    chartWidth: number;

    /** Layout callback that reports the chart container's measured width */
    onLayout: (event: LayoutChangeEvent) => void;

    /** Font manager for Paragraph API rendering with multi-font fallback */
    fontManager: SkTypefaceFontProvider;

    /** Formats a numeric value for display */
    formatValue: (value: number) => string;

    /** Y-axis domain override, applied to the value axis (rendered horizontally) */
    yAxisDomain: [number] | undefined;

    /** When true, all bars use the same color. When false, each bar uses a different color from the palette. */
    useSingleColor: boolean;

    /** Callback when a bar is pressed, given its data index */
    onBarPress: (index: number) => void;

    /** Truncated category labels for the Y axis, in original data order */
    truncatedCategoryLabels: string[];

    /** Pixel width of the ellipsis character, used for value-label truncation */
    ellipsisWidth: number;
};

/**
 * Renders bar chart data as horizontal bars with category labels on the Y axis and value labels
 * on the X axis. Used as a fallback when vertical bar labels don't fit at 0°, 45°, or 90° rotation.
 */
function HorizontalBarChart({
    data,
    chartWidth,
    onLayout,
    fontManager,
    formatValue,
    yAxisDomain,
    useSingleColor,
    onBarPress,
    truncatedCategoryLabels,
    ellipsisWidth,
}: HorizontalBarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const horizontalChartData = data.map((point, index) => ({
        x: point.total,
        y: data.length - 1 - index,
    }));

    const categoryIndices = data.map((_, index) => index);

    const barHeight = useSharedValue(0);
    const xZero = useSharedValue(0);

    const handleHorizontalChartBoundsChange = (bounds: ChartBounds) => {
        const domainHeight = bounds.bottom - bounds.top;
        const plotHeight = domainHeight - HORIZONTAL_DOMAIN_PADDING.top - HORIZONTAL_DOMAIN_PADDING.bottom;
        const slotHeight = data.length > 1 ? plotHeight / (data.length - 1) : plotHeight;
        const calculatedBarHeight = (1 - BAR_INNER_PADDING) * slotHeight;
        barHeight.set(calculatedBarHeight);
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
        handlePress: onBarPress,
        checkIsOver: checkIsOverHorizontalBar,
        nearestPointAxis: 'y',
        tooltipPlacement: 'right',
    });

    const handleHorizontalScaleChange = (xScale: Scale, yScale: Scale) => {
        xZero.set(xScale(0));
        setPointPositions(
            horizontalChartData.map((point) => xScale(point.x)),
            horizontalChartData.map((point) => yScale(point.y)),
        );
    };

    const cursorStyle = useChartCursorStyle(isCursorOverClickable);

    const renderHorizontalBar = (point: PointsArray[number], chartBounds: ChartBounds, barCount: number, dataIndex: number, xScale: Scale) => {
        if (typeof point.y !== 'number') {
            return null;
        }

        const barColor = getBarColor(useSingleColor, dataIndex);
        // victory-native's `Bar` only knows how to draw vertical bars (see createHorizontalBarPath jsdoc),
        // so the bar thickness (perpendicular to the value axis) is derived from the chart's vertical extent here
        // instead of relying on `Bar`'s internal `useBarWidth`, which assumes bars are laid out horizontally.
        const barThickness = ((1 - BAR_INNER_PADDING) * (chartBounds.bottom - chartBounds.top)) / Math.max(1, barCount);
        const path = createHorizontalBarPath(point.x, point.y, xScale(0), barThickness, {
            topLeft: BAR_CORNER_RADIUS,
            topRight: BAR_CORNER_RADIUS,
            bottomLeft: BAR_CORNER_RADIUS,
            bottomRight: BAR_CORNER_RADIUS,
        });

        return (
            <Path
                key={`horizontal-bar-${data.at(dataIndex)?.label ?? dataIndex}`}
                path={path}
                // eslint-disable-next-line react/style-prop-object -- this is a valid Skia style prop value
                style="fill"
                color={barColor}
            />
        );
    };

    const renderHorizontalOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
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

    const horizontalCategoryLabelWidth = getCategoryLabelWidth(truncatedCategoryLabels, fontManager, variables.iconSizeExtraSmall);
    const horizontalValueLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, VALUE_AXIS_DOMAIN_PADDING);
    const {ascent, descent} = getFontLineMetrics(fontManager, variables.iconSizeExtraSmall);
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

    const chartBody = (
        <GestureDetector gesture={customGestures}>
            <Animated.View
                style={[horizontalChartStyle, cursorStyle]}
                onLayout={onLayout}
            >
                {chartWidth > 0 && (
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
                        {({points, chartBounds, xScale}) =>
                            useSingleColor ? (
                                <BarGroup
                                    chartBounds={chartBounds}
                                    withinGroupPadding={BAR_INNER_PADDING}
                                    isHorizontal
                                    roundedCorners={{topRight: BAR_CORNER_RADIUS, bottomRight: BAR_CORNER_RADIUS}}
                                >
                                    {[
                                        <BarGroup.Bar
                                            key="horizontal-bars-single-color"
                                            points={points.y}
                                            color={getBarColor(useSingleColor, 0)}
                                        />,
                                    ]}
                                </BarGroup>
                            ) : (
                                points.y.map((point, index) => renderHorizontalBar(point, chartBounds, points.y.length, index, xScale))
                            )
                        }
                    </CartesianChart>
                )}
                <ChartTooltipLayer
                    matchedIndex={matchedIndex}
                    isTooltipActive={isTooltipActive}
                    data={data}
                    formatValue={formatValue}
                    chartWidth={chartWidth}
                    initialTooltipPosition={initialTooltipPosition}
                    placement={tooltipPlacement}
                />
            </Animated.View>
        </GestureDetector>
    );

    if (needsHorizontalScroll) {
        return (
            <ScrollView
                style={styles.chartHorizontalScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
            >
                {chartBody}
            </ScrollView>
        );
    }

    return chartBody;
}

export default HorizontalBarChart;
