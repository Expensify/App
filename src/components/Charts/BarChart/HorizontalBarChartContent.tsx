import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';
import {BarGroup, CartesianChart} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import BAR_INNER_PADDING, {MAX_HORIZONTAL_CHART_HEIGHT, MIN_BAR_ROW_HEIGHT} from '@components/Charts/barChartConstants';
import ChartCategoryYAxisLabels from '@components/Charts/components/ChartCategoryYAxisLabels';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartValueXAxisLabels from '@components/Charts/components/ChartValueXAxisLabels';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartFontManager, useChartInteractions, useChartLabelFormats, useChartLabelMeasurements, useDynamicYDomain} from '@components/Charts/hooks';
import {getCategoryLabelWidth, getFontLineMetrics, getYAxisLabelWidth, truncateCategoryLabels} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING} from '@components/Charts/VictoryTheme';
import ScrollView from '@components/ScrollView';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import type {CartesianChartProps, ChartDataPoint} from '..';

const HORIZONTAL_DOMAIN_PADDING = {top: 24, bottom: 24, right: 24, left: 0};
const VALUE_AXIS_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

type HorizontalBarChartProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;
    useSingleColor?: boolean;
};

function HorizontalBarChartContent({data, isLoading, yAxisUnit, yAxisUnitPosition = 'left', useSingleColor = false, onBarPress}: HorizontalBarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontManager = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);

    const chartData = data.map((point, index) => ({
        x: point.total,
        y: index,
    }));

    const categoryIndices = data.map((_, index) => index);
    const originalLabels = data.map((point) => point.label);
    const measurements = useChartLabelMeasurements(data, fontManager, variables.iconSizeExtraSmall);
    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const valueAxisDomain = useDynamicYDomain(data);
    const barHeight = useSharedValue(0);
    const xZero = useSharedValue(0);

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
        const barBottom = args.targetY + currentBarHeight / 2;

        return args.cursorX >= barLeft && args.cursorX <= barRight && args.cursorY >= barTop && args.cursorY <= barBottom;
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition, tooltipPlacement} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: checkIsOverHorizontalBar,
        nearestPointAxis: 'y',
        tooltipPlacement: 'right',
        xZero,
    });

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        const domainHeight = bounds.bottom - bounds.top;
        const calculatedBarHeight = ((1 - BAR_INNER_PADDING) * domainHeight) / data.length;
        barHeight.set(calculatedBarHeight);
    };

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        xZero.set(xScale(0));
        setPointPositions(
            chartData.map((point) => xScale(point.x)),
            chartData.map((point) => yScale(point.y)),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const truncatedCategoryLabels = truncateCategoryLabels(originalLabels, measurements.labelWidths, measurements.ellipsisWidth);
    const categoryLabelWidth = getCategoryLabelWidth(truncatedCategoryLabels, fontManager, variables.iconSizeExtraSmall);

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        if (!fontManager) {
            return null;
        }

        return (
            <>
                <ChartCategoryYAxisLabels
                    truncatedLabels={truncatedCategoryLabels}
                    categoryIndices={categoryIndices}
                    yScale={args.yScale}
                    chartBounds={args.chartBounds}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.textSupporting}
                />
                <ChartValueXAxisLabels
                    xTicks={args.xTicks}
                    xScale={args.xScale}
                    chartBounds={args.chartBounds}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.textSupporting}
                    formatValue={formatValue}
                />
            </>
        );
    };

    const valueLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, VALUE_AXIS_DOMAIN_PADDING);
    const {ascent, descent} = fontManager ? getFontLineMetrics(fontManager, variables.iconSizeExtraSmall) : {ascent: 0, descent: 0};
    const xAxisLabelHeight = ascent + descent + VictoryTheme.axis.labelGap;

    const contentHeight = Math.max(CHART_CONTENT_MIN_HEIGHT, data.length * MIN_BAR_ROW_HEIGHT + VictoryTheme.axis.padding.top + VictoryTheme.axis.padding.bottom + xAxisLabelHeight);
    const needsScroll = contentHeight > MAX_HORIZONTAL_CHART_HEIGHT;

    const chartPadding = {
        ...VictoryTheme.axis.padding,
        left: categoryLabelWidth + GLYPH_PADDING,
        bottom: xAxisLabelHeight + VictoryTheme.axis.padding.bottom,
        right: valueLabelWidth + GLYPH_PADDING,
    };

    const defaultBarColor = VictoryTheme.colors.default;

    if (isLoading || !fontManager) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'HorizontalBarChartContent',
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

    const chartBody = (
        <GestureDetector gesture={customGestures}>
            <Animated.View
                style={[styles.chartContent, {height: contentHeight}, cursorStyle]}
                onLayout={handleLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        yKeys={['y']}
                        padding={chartPadding}
                        domain={{
                            y: [0, data.length - 1],
                            ...(valueAxisDomain ? {x: valueAxisDomain} : {}),
                        }}
                        domainPadding={HORIZONTAL_DOMAIN_PADDING}
                        onChartBoundsChange={handleChartBoundsChange}
                        onScaleChange={handleScaleChange}
                        renderOutside={renderOutside}
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
                        data={chartData}
                    >
                        {({points, chartBounds}) => (
                            <BarGroup
                                chartBounds={chartBounds}
                                withinGroupPadding={BAR_INNER_PADDING}
                                isHorizontal
                                roundedCorners={{topRight: 8, bottomRight: 8}}
                            >
                                {useSingleColor
                                    ? [
                                          <BarGroup.Bar
                                              key="horizontal-bars-single-color"
                                              points={points.y}
                                              color={defaultBarColor}
                                          />,
                                      ]
                                    : points.y.map((point, index) => (
                                          <BarGroup.Bar
                                              key={`horizontal-bar-${data.at(index)?.label ?? index}`}
                                              points={[point]}
                                              color={VictoryTheme.colors.getColor(index)}
                                          />
                                      ))}
                            </BarGroup>
                        )}
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

    if (!needsScroll) {
        return chartBody;
    }

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

export default HorizontalBarChartContent;
