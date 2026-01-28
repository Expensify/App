import {useFont} from '@shopify/react-native-skia';
import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated, {useSharedValue} from 'react-native-reanimated';
import type {ChartBounds, PointsArray} from 'victory-native';
import {Bar, CartesianChart} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartTooltip from '@components/Charts/ChartTooltip';
import ChartHeader from '@components/Charts/components/ChartHeader';
import {
    BAR_INNER_PADDING,
    BAR_ROUNDED_CORNERS,
    CHART_COLORS,
    CHART_PADDING,
    DEFAULT_SINGLE_BAR_COLOR_INDEX,
    DOMAIN_PADDING,
    DOMAIN_PADDING_SAFETY_BUFFER,
    FRAME_LINE_WIDTH,
    X_AXIS_LINE_WIDTH,
    Y_AXIS_LABEL_OFFSET,
    Y_AXIS_LINE_WIDTH,
    Y_AXIS_TICK_COUNT,
} from '@components/Charts/constants';
import fontSource from '@components/Charts/font';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartColors, useChartInteractions, useChartLabelFormats, useChartLabelLayout} from '@components/Charts/hooks';
import type {BarChartProps} from '@components/Charts/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/**
 * Calculate minimum domainPadding required to prevent bars from overflowing chart edges.
 *
 * The issue: victory-native calculates bar width as (1 - innerPadding) * chartWidth / barCount,
 * but positions bars at indices [0, 1, ..., n-1] scaled to the chart width with domainPadding.
 * For small bar counts, the default padding is insufficient and bars overflow.
 */
function calculateMinDomainPadding(chartWidth: number, barCount: number, innerPadding: number): number {
    if (barCount <= 0) {
        return 0;
    }
    const minPaddingRatio = (1 - innerPadding) / (2 * (barCount - 1 + innerPadding));
    return Math.ceil(chartWidth * minPaddingRatio * DOMAIN_PADDING_SAFETY_BUFFER);
}

function BarChartContent({data, title, titleIcon, isLoading, yAxisUnit, yAxisUnitPosition = 'left', useSingleColor = false, onBarPress}: BarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const font = useFont(fontSource, variables.iconSizeExtraSmall);
    const [chartWidth, setChartWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const defaultBarColor = CHART_COLORS.at(DEFAULT_SINGLE_BAR_COLOR_INDEX);

    // prepare data for display
    const chartData = useMemo(() => {
        return data.map((point, index) => ({
            x: index,
            y: point.total,
        }));
    }, [data]);

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
        const {width, height} = event.nativeEvent.layout;
        setChartWidth(width);
        setContainerHeight(height);
    }, []);

    const {labelRotation, labelSkipInterval, truncatedLabels, maxLabelLength} = useChartLabelLayout({
        data,
        font,
        chartWidth,
        containerHeight,
    });

    const domainPadding = useMemo(() => {
        if (chartWidth === 0) {
            return {left: 0, right: 0, top: DOMAIN_PADDING.top, bottom: DOMAIN_PADDING.bottom};
        }
        const horizontalPadding = calculateMinDomainPadding(chartWidth, data.length, BAR_INNER_PADDING);
        return {left: horizontalPadding, right: horizontalPadding + DOMAIN_PADDING.right, top: DOMAIN_PADDING.top, bottom: DOMAIN_PADDING.bottom};
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
        },
        [data.length, barGeometry],
    );

    const handleScaleChange = useCallback(
        (_xScale: unknown, yScale: (value: number) => number) => {
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

    const tooltipData = useMemo(() => {
        if (activeDataIndex < 0 || activeDataIndex >= data.length) {
            return null;
        }
        const dataPoint = data.at(activeDataIndex);
        if (!dataPoint) {
            return null;
        }
        const formatted = dataPoint.total.toLocaleString();
        let formattedAmount = formatted;
        if (yAxisUnit) {
            // Add space for multi-character codes (e.g., "PLN 100") but not for symbols (e.g., "$100")
            const separator = yAxisUnit.length > 1 ? ' ' : '';
            formattedAmount = yAxisUnitPosition === 'left' ? `${yAxisUnit}${separator}${formatted}` : `${formatted}${separator}${yAxisUnit}`;
        }
        return {
            label: dataPoint.label,
            amount: formattedAmount,
        };
    }, [activeDataIndex, data, yAxisUnit, yAxisUnitPosition]);

    const {getChartColor} = useChartColors();

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
                    roundedCorners={BAR_ROUNDED_CORNERS}
                />
            );
        },
        [data, useSingleColor, defaultBarColor, getChartColor],
    );

    const dynamicChartStyle = useMemo(
        () => ({
            height: 250 + (maxLabelLength ?? 0) + 100,
        }),
        [maxLabelLength],
    );

    if (isLoading || !font) {
        return (
            <View style={[styles.barChartContainer, styles.highlightBG, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }
    return (
        <View style={[styles.barChartContainer, styles.highlightBG]}>
            <ChartHeader
                title={title}
                titleIcon={titleIcon}
            />
            <View
                style={[styles.barChartChartContainer, labelRotation === -90 ? dynamicChartStyle : undefined]}
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
                            },
                        ]}
                        frame={{lineWidth: FRAME_LINE_WIDTH}}
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
                        />
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

export default BarChartContent;
