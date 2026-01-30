import {useFont} from '@shopify/react-native-skia';
import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import {CartesianChart, Line, Scatter} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import {getChartColor} from '@components/Charts/chartColors';
import ChartHeader from '@components/Charts/ChartHeader';
import ChartTooltip from '@components/Charts/ChartTooltip';
import {
    CHART_CONTENT_MIN_HEIGHT,
    CHART_PADDING,
    DOT_INNER_RADIUS,
    DOT_OUTER_RADIUS,
    LINE_CHART_FRAME,
    X_AXIS_LINE_WIDTH,
    Y_AXIS_DOMAIN,
    Y_AXIS_LABEL_OFFSET,
    Y_AXIS_LINE_WIDTH,
    Y_AXIS_TICK_COUNT,
} from '@components/Charts/constants';
import fontSource from '@components/Charts/font';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartInteractions, useChartLabelFormats, useChartLabelLayout} from '@components/Charts/hooks';
import type {LineChartProps} from '@components/Charts/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/** Symmetric domain padding for line charts */
const LINE_DOMAIN_PADDING = {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
};

function LineChartContent({data, title, titleIcon, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onPointPress}: LineChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const font = useFont(fontSource, variables.iconSizeExtraSmall);
    const [chartWidth, setChartWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const chartData = useMemo(() => {
        return data.map((point, index) => ({
            x: index,
            y: point.total,
        }));
    }, [data]);

    const handlePointPress = useCallback(
        (index: number) => {
            if (index < 0 || index >= data.length) {
                return;
            }
            const dataPoint = data.at(index);
            if (dataPoint && onPointPress) {
                onPointPress(dataPoint, index);
            }
        },
        [data, onPointPress],
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
        barAreaWidth: chartWidth,
        containerHeight,
    });

    const {formatXAxisLabel, formatYAxisLabel} = useChartLabelFormats({
        data,
        yAxisUnit,
        yAxisUnitPosition,
        labelSkipInterval,
        labelRotation,
        truncatedLabels,
    });

    const checkIsOverDot = useCallback(
        (args: HitTestArgs) => {
            'worklet';

            const dx = args.cursorX - args.targetX;
            const dy = args.cursorY - args.targetY;
            return Math.sqrt(dx * dx + dy * dy) <= DOT_INNER_RADIUS;
        },
        [],
    );

    const {actionsRef, customGestures, activeDataIndex, isTooltipActive, tooltipStyle} = useChartInteractions({
        handlePress: handlePointPress,
        checkIsOver: checkIsOverDot,
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
            const separator = yAxisUnit.length > 1 ? ' ' : '';
            formattedAmount = yAxisUnitPosition === 'left' ? `${yAxisUnit}${separator}${formatted}` : `${formatted}${separator}${yAxisUnit}`;
        }
        const totalSum = data.reduce((sum, point) => sum + Math.abs(point.total), 0);
        const percent = totalSum > 0 ? Math.round((Math.abs(dataPoint.total) / totalSum) * 100) : 0;
        return {
            label: dataPoint.label,
            amount: formattedAmount,
            percentage: percent < 1 ? '<1%' : `${percent}%`,
        };
    }, [activeDataIndex, data, yAxisUnit, yAxisUnitPosition]);

    const dynamicChartStyle = useMemo(
        () => ({
            height: CHART_CONTENT_MIN_HEIGHT + (maxLabelLength ?? 0),
        }),
        [maxLabelLength],
    );

    if (isLoading || !font) {
        return (
            <View style={[styles.lineChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <View style={[styles.lineChartContainer, styles.highlightBG, shouldUseNarrowLayout ? styles.p5 : styles.p8]}>
            <ChartHeader
                title={title}
                titleIcon={titleIcon}
            />
            <View
                style={[styles.lineChartChartContainer, labelRotation === -90 ? dynamicChartStyle : undefined]}
                onLayout={handleLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        padding={CHART_PADDING}
                        yKeys={['y']}
                        domainPadding={LINE_DOMAIN_PADDING}
                        actionsRef={actionsRef}
                        customGestures={customGestures}
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
                                domain: Y_AXIS_DOMAIN,
                            },
                        ]}
                        frame={LINE_CHART_FRAME}
                        data={chartData}
                    >
                        {({points}) => (
                            <>
                                <Line
                                    points={points.y}
                                    color={getChartColor(5)}
                                    strokeWidth={2}
                                    curveType="linear"
                                />
                                <Scatter
                                    points={points.y}
                                    radius={DOT_INNER_RADIUS}
                                    color={getChartColor(5)}
                                />
                            </>
                        )}
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

export default LineChartContent;
