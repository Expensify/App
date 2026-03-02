import {useFont} from '@shopify/react-native-skia';
import React, {useCallback, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds} from 'victory-native';
import {CartesianChart, Line} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartHeader from '@components/Charts/components/ChartHeader';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import LeftFrameLine from '@components/Charts/components/LeftFrameLine';
import ScatterPoints from '@components/Charts/components/ScatterPoints';
import {AXIS_LABEL_GAP, CHART_CONTENT_MIN_HEIGHT, CHART_PADDING, X_AXIS_LINE_WIDTH, Y_AXIS_LINE_WIDTH, Y_AXIS_TICK_COUNT} from '@components/Charts/constants';
import fontSource from '@components/Charts/font';
import type {HitTestArgs} from '@components/Charts/hooks';
import {useChartInteractions, useChartLabelFormats, useChartLabelLayout, useDynamicYDomain, useTooltipData} from '@components/Charts/hooks';
import type {CartesianChartProps, ChartDataPoint} from '@components/Charts/types';
import {calculateMinDomainPadding, DEFAULT_CHART_COLOR, measureTextWidth} from '@components/Charts/utils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

/** Inner dot radius for line chart data points */
const DOT_RADIUS = 6;

/** Extra hover area beyond the dot radius for easier touch targeting */
const DOT_HOVER_EXTRA_RADIUS = 2;

/** Minimum safe padding to avoid clipping labels/points */
const MIN_SAFE_PADDING = DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;

/** Base domain padding applied to all sides */
const BASE_DOMAIN_PADDING = {top: 16, bottom: 16, left: 0, right: 0};

type LineChartProps = CartesianChartProps & {
    /** Callback when a data point is pressed */
    onPointPress?: (dataPoint: ChartDataPoint, index: number) => void;
};

function LineChartContent({data, title, titleIcon, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onPointPress}: LineChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const font = useFont(fontSource, variables.iconSizeExtraSmall);
    const [chartWidth, setChartWidth] = useState(0);
    const [plotAreaWidth, setPlotAreaWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);

    const yAxisDomain = useDynamicYDomain(data);
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
        setChartWidth(event.nativeEvent.layout.width);
    }, []);

    const handleChartBoundsChange = useCallback((bounds: ChartBounds) => {
        setPlotAreaWidth(bounds.right - bounds.left);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
    }, []);

    // Optimize by reducing wasted space when edge labels are shorter than tick spacing
    const domainPadding = useMemo(() => {
        if (chartWidth === 0 || data.length === 0) {
            return BASE_DOMAIN_PADDING;
        }

        const geometricPadding = calculateMinDomainPadding(chartWidth, data.length);

        if (!font) {
            return {...BASE_DOMAIN_PADDING, left: geometricPadding, right: geometricPadding};
        }

        const firstLabelWidth = measureTextWidth(data.at(0)?.label ?? '', font);
        const lastLabelWidth = measureTextWidth(data.at(-1)?.label ?? '', font);

        // At 0° rotation, centered labels extend by half their width
        const firstLabelNeeds = firstLabelWidth / 2;
        const lastLabelNeeds = lastLabelWidth / 2;

        const wastedLeft = geometricPadding - firstLabelNeeds;
        const wastedRight = geometricPadding - lastLabelNeeds;
        const reclaimablePadding = Math.min(wastedLeft, wastedRight);

        // Only reduce if both sides have excess space (labels short enough for 0°)
        if (reclaimablePadding <= 0) {
            return {...BASE_DOMAIN_PADDING, left: geometricPadding, right: geometricPadding};
        }

        const horizontalPadding = Math.max(geometricPadding - reclaimablePadding, MIN_SAFE_PADDING);
        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding};
    }, [chartWidth, data, font]);

    const tickSpacing = plotAreaWidth > 0 && data.length > 0 ? plotAreaWidth / data.length : 0;

    const {labelRotation, labelSkipInterval, truncatedLabels, xAxisLabelHeight} = useChartLabelLayout({
        data,
        font,
        tickSpacing,
        labelAreaWidth: plotAreaWidth,
        firstTickLeftSpace: boundsLeft,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - boundsRight : 0,
        allowTightDiagonalPacking: true,
    });

    const {formatValue} = useChartLabelFormats({
        data,
        font,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const checkIsOverDot = useCallback((args: HitTestArgs) => {
        'worklet';

        const dx = args.cursorX - args.targetX;
        const dy = args.cursorY - args.targetY;
        return Math.sqrt(dx * dx + dy * dy) <= DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;
    }, []);

    const {actionsRef, customGestures, activeDataIndex, isTooltipActive, initialTooltipPosition} = useChartInteractions({
        handlePress: handlePointPress,
        checkIsOver: checkIsOverDot,
    });

    const tooltipData = useTooltipData(activeDataIndex, data, formatValue);

    const renderOutsideComponents = useCallback(
        (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
            return (
                <>
                    <LeftFrameLine
                        chartBounds={args.chartBounds}
                        yTicks={args.yTicks}
                        yScale={args.yScale}
                        color={theme.border}
                    />
                    <ScatterPoints
                        points={args.points.y}
                        radius={DOT_RADIUS}
                        color={DEFAULT_CHART_COLOR}
                    />
                    {!!font && (
                        <ChartXAxisLabels
                            labels={truncatedLabels}
                            labelRotation={labelRotation}
                            labelSkipInterval={labelSkipInterval}
                            font={font}
                            labelColor={theme.textSupporting}
                            xScale={args.xScale}
                            chartBoundsBottom={args.chartBounds.bottom}
                        />
                    )}
                </>
            );
        },
        [font, truncatedLabels, labelRotation, labelSkipInterval, theme.textSupporting, theme.border],
    );

    const dynamicChartStyle = useMemo(
        () => ({
            height: CHART_CONTENT_MIN_HEIGHT + (xAxisLabelHeight ?? 0),
        }),
        [xAxisLabelHeight],
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
                style={[styles.lineChartChartContainer, dynamicChartStyle]}
                onLayout={handleLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        padding={{top: CHART_PADDING, left: CHART_PADDING, right: CHART_PADDING, bottom: (xAxisLabelHeight ?? 0) + CHART_PADDING}}
                        yKeys={['y']}
                        domainPadding={domainPadding}
                        actionsRef={actionsRef}
                        customGestures={customGestures}
                        onChartBoundsChange={handleChartBoundsChange}
                        renderOutside={renderOutsideComponents}
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
                        {({points}) => (
                            <Line
                                points={points.y}
                                color={DEFAULT_CHART_COLOR}
                                strokeWidth={2}
                                curveType="linear"
                            />
                        )}
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
        </View>
    );
}

export default LineChartContent;
export type {LineChartProps};
