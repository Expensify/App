import {useFont} from '@shopify/react-native-skia';
import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';
import {Bar, CartesianChart} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartHeader from '@components/Charts/components/ChartHeader';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import {
    AXIS_LABEL_GAP,
    CHART_CONTENT_MIN_HEIGHT,
    CHART_PADDING,
    DIAGONAL_ANGLE_RADIAN_THRESHOLD,
    X_AXIS_LINE_WIDTH,
    Y_AXIS_LINE_WIDTH,
    Y_AXIS_TICK_COUNT,
} from '@components/Charts/constants';
import fontSource from '@components/Charts/font';
import type {ComputeGeometryFn, HitTestArgs} from '@components/Charts/hooks';
import {useChartInteractions, useChartLabelFormats, useChartLabelLayout, useDynamicYDomain, useLabelHitTesting, useTooltipData} from '@components/Charts/hooks';
import type {CartesianChartProps, ChartDataPoint} from '@components/Charts/types';
import {calculateMinDomainPadding, DEFAULT_CHART_COLOR, getChartColor, rotatedLabelYOffset} from '@components/Charts/utils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';

/** Inner padding between bars (0.3 = 30% of bar width) */
const BAR_INNER_PADDING = 0.3;

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop)
 * We need bottom: 1 for proper display of the bottom label
 */
const BASE_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

/**
 * Bar chart geometry for label hit-testing.
 * Labels are center-anchored: the 45° parallelogram's upper-right corner is offset
 * by (halfLabelWidth * sinA) right and up, so the box straddles the tick symmetrically.
 */
const computeBarLabelGeometry: ComputeGeometryFn = ({ascent, descent, sinA, angleRad, labelWidths, padding}) => {
    const maxLabelWidth = labelWidths.length > 0 ? Math.max(...labelWidths) : 0;
    const centeredUpwardOffset = angleRad > 0 ? (maxLabelWidth / 2) * sinA : 0;
    const halfLabelSins = labelWidths.map((w) => (w / 2) * sinA - variables.iconSizeExtraSmall / 3);
    const halfWidths = labelWidths.map((w) => w / 2);
    let additionalOffset = 0;
    if (angleRad > 0 && angleRad < DIAGONAL_ANGLE_RADIAN_THRESHOLD) {
        additionalOffset = variables.iconSizeExtraSmall / 1.5;
    } else if (angleRad > 1) {
        additionalOffset = variables.iconSizeExtraSmall / 3;
    }
    return {
        // variables.iconSizeExtraSmall / 3 is the vertical offset of label from the axis line
        labelYOffset: AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad) + centeredUpwardOffset - additionalOffset,
        iconSin: variables.iconSizeExtraSmall * sinA,
        labelSins: labelWidths.map((w) => w * sinA),
        halfWidths,
        cornerAnchorDX: halfLabelSins,
        cornerAnchorDY: halfLabelSins.map((v) => -v),
        yMin90Offsets: halfWidths.map((hw) => -hw + padding),
        yMax90Offsets: halfWidths.map((hw) => hw + padding),
    };
};

type BarChartProps = CartesianChartProps & {
    /** Callback when a bar is pressed */
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** When true, all bars use the same color. When false (default), each bar uses a different color from the palette. */
    useSingleColor?: boolean;
};

function BarChartContent({data, title, titleIcon, isLoading, yAxisUnit, yAxisUnitPosition = 'left', useSingleColor = false, onBarPress}: BarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const font = useFont(fontSource, variables.iconSizeExtraSmall);
    const [chartWidth, setChartWidth] = useState(0);
    const [barAreaWidth, setBarAreaWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);
    const defaultBarColor = DEFAULT_CHART_COLOR;

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

    const {labelRotation, labelSkipInterval, truncatedLabels, xAxisLabelHeight} = useChartLabelLayout({
        data,
        font,
        tickSpacing: barAreaWidth > 0 ? barAreaWidth / data.length : 0,
        labelAreaWidth: barAreaWidth,
        firstTickLeftSpace: boundsLeft + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - boundsRight + domainPadding.right * paddingScale : 0,
    });

    const {formatValue} = useChartLabelFormats({
        data,
        font,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const barWidth = useSharedValue(0);
    const chartBottom = useSharedValue(0);
    const yZero = useSharedValue(0);

    const {isCursorOverLabel, findLabelCursorX, updateTickPositions} = useLabelHitTesting({
        font,
        truncatedLabels,
        labelRotation,
        labelSkipInterval,
        chartBottom,
        computeGeometry: computeBarLabelGeometry,
    });

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        const domainWidth = bounds.right - bounds.left;
        const calculatedBarWidth = ((1 - BAR_INNER_PADDING) * domainWidth) / data.length;
        barWidth.set(calculatedBarWidth);
        chartBottom.set(bounds.bottom);
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

    const {customGestures, setPointPositions, activeDataIndex, isTooltipActive, initialTooltipPosition} = useChartInteractions({
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

    const tooltipData = useTooltipData(activeDataIndex, data, formatValue);

    const renderBar = (point: PointsArray[number], chartBounds: ChartBounds, barCount: number) => {
        const dataIndex = point.xValue as number;
        const dataPoint = data.at(dataIndex);
        const barColor = useSingleColor ? defaultBarColor : getChartColor(dataIndex);

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
        if (!font || xAxisLabelHeight === undefined) {
            return null;
        }
        return (
            <ChartXAxisLabels
                labels={truncatedLabels}
                labelRotation={labelRotation}
                labelSkipInterval={labelSkipInterval}
                font={font}
                labelColor={theme.textSupporting}
                xScale={args.xScale}
                chartBoundsBottom={args.chartBounds.bottom}
                centerRotatedLabels
            />
        );
    };

    const labelSpace = AXIS_LABEL_GAP + (xAxisLabelHeight ?? 0);
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const chartPadding = {...CHART_PADDING, bottom: labelSpace + CHART_PADDING.bottom};

    if (isLoading || !font) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'BarChartContent', isLoading, isFontLoading: !font};
        return (
            <View style={[styles.barChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8, styles.justifyContentCenter, styles.alignItemsCenter]}>
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
        <View style={[styles.barChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8]}>
            <ChartHeader
                title={title}
                titleIcon={titleIcon}
            />
            <GestureDetector gesture={customGestures}>
                <View
                    style={[styles.barChartChartContainer, dynamicChartStyle]}
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
                                lineWidth: X_AXIS_LINE_WIDTH,
                            }}
                            yAxis={[
                                {
                                    font,
                                    labelColor: theme.textSupporting,
                                    formatYLabel: formatValue,
                                    tickCount: Y_AXIS_TICK_COUNT,
                                    lineWidth: Y_AXIS_LINE_WIDTH,
                                    lineColor: theme.border,
                                    labelOffset: AXIS_LABEL_GAP,
                                    domain: yAxisDomain,
                                },
                            ]}
                            frame={{lineWidth: 0}}
                            data={chartData}
                        >
                            {({points, chartBounds}) => <>{points.y.map((point) => renderBar(point, chartBounds, points.y.length))}</>}
                        </CartesianChart>
                    )}
                    {isTooltipActive && !!tooltipData && (
                        <ChartTooltip
                            label={tooltipData.label}
                            amount={tooltipData.amount}
                            percentage={tooltipData.percentage}
                            chartWidth={chartWidth}
                            initialTooltipPosition={initialTooltipPosition}
                        />
                    )}
                </View>
            </GestureDetector>
        </View>
    );
}

export default BarChartContent;
export type {BarChartProps};
