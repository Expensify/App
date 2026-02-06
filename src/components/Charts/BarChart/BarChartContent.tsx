import {useFont} from '@shopify/react-native-skia';
import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated, {useSharedValue} from 'react-native-reanimated';
import type {ChartBounds, PointsArray, Scale} from 'victory-native';
import {Bar, CartesianChart} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartHeader from '@components/Charts/components/ChartHeader';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import {CHART_CONTENT_MIN_HEIGHT, CHART_PADDING, X_AXIS_LINE_WIDTH, Y_AXIS_LABEL_OFFSET, Y_AXIS_LINE_WIDTH, Y_AXIS_TICK_COUNT} from '@components/Charts/constants';
import fontSource from '@components/Charts/font';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartInteractions, useChartLabelFormats, useChartLabelLayout, useDynamicYDomain, useTooltipData} from '@components/Charts/hooks';
import type {CartesianChartProps, ChartDataPoint} from '@components/Charts/types';
import {calculateMinDomainPadding, DEFAULT_CHART_COLOR, getChartColor} from '@components/Charts/utils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/** Inner padding between bars (0.3 = 30% of bar width) */
const BAR_INNER_PADDING = 0.3;

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop) */
const BASE_DOMAIN_PADDING = {top: 32, bottom: 0, left: 0, right: 0};

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
    const defaultBarColor = DEFAULT_CHART_COLOR;

    // prepare data for display
    const chartData = useMemo(() => {
        return data.map((point, index) => ({
            x: index,
            y: point.total,
        }));
    }, [data]);

    const yAxisDomain = useDynamicYDomain(data);

    // Handle bar press callback
    const handleBarPress = useCallback(
        (index: number) => {
            if (index < 0 || index >= data.length) {
                return;
            }
            const dataPoint = data.at(index);
            if (dataPoint && onBarPress) {
                onBarPress(dataPoint, index);
            }
        },
        [data, onBarPress],
    );

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    }, []);

    const {labelRotation, labelSkipInterval, truncatedLabels, xAxisLabelHeight} = useChartLabelLayout({
        data,
        font,
        tickSpacing: barAreaWidth > 0 ? barAreaWidth / data.length : 0,
        labelAreaWidth: barAreaWidth,
    });

    const domainPadding = useMemo(() => {
        if (chartWidth === 0) {
            return BASE_DOMAIN_PADDING;
        }
        const horizontalPadding = calculateMinDomainPadding(chartWidth, data.length, BAR_INNER_PADDING);
        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding};
    }, [chartWidth, data.length]);

    const {formatXAxisLabel, formatYAxisLabel} = useChartLabelFormats({
        data,
        yAxisUnit,
        yAxisUnitPosition,
        labelSkipInterval,
        labelRotation,
        truncatedLabels,
    });

    // Store bar geometry for hit-testing (only constants, no arrays)
    const barGeometry = useSharedValue({barWidth: 0, chartBottom: 0, yZero: 0});

    const handleChartBoundsChange = useCallback(
        (bounds: ChartBounds) => {
            const domainWidth = bounds.right - bounds.left;
            const calculatedBarWidth = ((1 - BAR_INNER_PADDING) * domainWidth) / data.length;
            barGeometry.set({
                ...barGeometry.get(),
                barWidth: calculatedBarWidth,
                chartBottom: bounds.bottom,
            });
            setBarAreaWidth(domainWidth);
        },
        [data.length, barGeometry],
    );

    const handleScaleChange = useCallback(
        (_xScale: Scale, yScale: Scale) => {
            barGeometry.set({
                ...barGeometry.get(),
                yZero: yScale(0),
            });
        },
        [barGeometry],
    );

    const checkIsOverBar = useCallback(
        (args: HitTestArgs) => {
            'worklet';

            const {barWidth, yZero} = barGeometry.get();
            if (barWidth === 0) {
                return false;
            }
            const barLeft = args.targetX - barWidth / 2;
            const barRight = args.targetX + barWidth / 2;
            // For positive bars: targetY < yZero, bar goes from targetY (top) to yZero (bottom)
            // For negative bars: targetY > yZero, bar goes from yZero (top) to targetY (bottom)
            const barTop = Math.min(args.targetY, yZero);
            const barBottom = Math.max(args.targetY, yZero);

            return args.cursorX >= barLeft && args.cursorX <= barRight && args.cursorY >= barTop && args.cursorY <= barBottom;
        },
        [barGeometry],
    );

    const {actionsRef, customGestures, activeDataIndex, isTooltipActive, tooltipStyle} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: checkIsOverBar,
        barGeometry,
    });

    const tooltipData = useTooltipData(activeDataIndex, data, yAxisUnit, yAxisUnitPosition);

    const renderBar = useCallback(
        (point: PointsArray[number], chartBounds: ChartBounds, barCount: number) => {
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
        },
        [data, useSingleColor, defaultBarColor],
    );

    // When labels are rotated 90°, add measured label height to container
    // This keeps bar area at ~250px while giving labels their needed vertical space
    const dynamicChartStyle = useMemo(
        () => ({
            height: CHART_CONTENT_MIN_HEIGHT + (xAxisLabelHeight ?? 0),
        }),
        [xAxisLabelHeight],
    );

    if (isLoading || !font) {
        return (
            <View style={[styles.barChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size="large" />
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
            <View
                style={[styles.barChartChartContainer, dynamicChartStyle]}
                onLayout={handleLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        padding={CHART_PADDING}
                        yKeys={['y']}
                        domainPadding={domainPadding}
                        actionsRef={actionsRef}
                        customGestures={customGestures}
                        onChartBoundsChange={handleChartBoundsChange}
                        onScaleChange={handleScaleChange}
                        xAxis={{
                            font,
                            tickCount: data.length,
                            labelColor: theme.textSupporting,
                            lineWidth: X_AXIS_LINE_WIDTH,
                            formatXLabel: formatXAxisLabel,
                            labelRotate: labelRotation,
                            labelOverflow: 'visible',
                        }}
                        yAxis={[
                            {
                                font,
                                labelColor: theme.textSupporting,
                                formatYLabel: formatYAxisLabel,
                                tickCount: Y_AXIS_TICK_COUNT,
                                lineWidth: Y_AXIS_LINE_WIDTH,
                                lineColor: theme.border,
                                labelOffset: Y_AXIS_LABEL_OFFSET,
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
                    <Animated.View style={tooltipStyle}>
                        <ChartTooltip
                            label={tooltipData.label}
                            amount={tooltipData.amount}
                            percentage={tooltipData.percentage}
                        />
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

export default BarChartContent;
export type {BarChartProps};
