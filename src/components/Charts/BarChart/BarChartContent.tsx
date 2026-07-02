import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';
import {Bar, CartesianChart} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
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
import {calculateMinDomainPadding, getYAxisLabelWidth} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING} from '@components/Charts/VictoryTheme';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import type {CartesianChartProps, ChartDataPoint} from '..';

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop)
 * We need bottom: 1 for proper display of the bottom label
 */
const BASE_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

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
    const [barAreaWidth, setBarAreaWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);
    const defaultBarColor = VictoryTheme.colors.default;

    const chartData = data.map((point, index) => ({
        x: index,
        y: point.total,
    }));

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

    const domainPadding = (() => {
        if (chartWidth === 0) {
            return BASE_DOMAIN_PADDING;
        }
        const horizontalPadding = calculateMinDomainPadding(chartWidth, data.length, BAR_INNER_PADDING);
        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding};
    })();

    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = barAreaWidth > 0 ? barAreaWidth / (barAreaWidth + totalDomainPadding) : 0;

    const originalLabels = data.map((p) => p.label);

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
        setBarAreaWidth(domainWidth);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
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
        handlePress: handleBarPress,
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
                roundedCorners={{topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8}}
            />
        );
    };

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
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

    const labelSpace = VictoryTheme.axis.labelGap + (xAxisLabelHeight ?? 0);
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const yAxisLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, BASE_DOMAIN_PADDING);
    const chartPadding = {...VictoryTheme.axis.padding, bottom: labelSpace + VictoryTheme.axis.padding.bottom, left: yAxisLabelWidth + GLYPH_PADDING};

    if (isLoading || !fontManager) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'BarChartContent', isLoading, isFontLoading: !fontManager};
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
        <GestureDetector gesture={customGestures}>
            <Animated.View
                style={[styles.chartContent, dynamicChartStyle, cursorStyle]}
                onLayout={handleLayout}
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

function BarChartContent(props: BarChartProps) {
    return (
        <ChartFontsProvider>
            <BarChartContentBody {...props} />
        </ChartFontsProvider>
    );
}

export default BarChartContent;
export type {BarChartProps};
