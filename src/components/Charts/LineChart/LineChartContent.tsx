import ActivityIndicator from '@components/ActivityIndicator';
import AreaGradient from '@components/Charts/components/AreaGradient';
import ChartLegend from '@components/Charts/components/ChartLegend';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import LeftFrameLine from '@components/Charts/components/LeftFrameLine';
import ScatterPoints from '@components/Charts/components/ScatterPoints';
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
import {getPointValues, getSeriesValue, getXAxisLabel, getYAxisLabelWidth, labelOverhang} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING, LABEL_PADDING, LABEL_ROTATIONS, SIN_45} from '@components/Charts/VictoryTheme';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';

import React, {useState} from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {CartesianChart, Line} from 'victory-native';

import type {CartesianChartProps, ChartDataPoint} from '..';

/** Inner dot radius for line chart data points */
const DOT_RADIUS = 4;

/** Extra hover area beyond the dot radius for easier touch targeting */
const DOT_HOVER_EXTRA_RADIUS = 2;

/** Base domain padding applied to all sides */
const BASE_DOMAIN_PADDING = {top: 16, bottom: 16, left: 0, right: 0};

/** A point as victory-native reads it: the x index plus one entry per series, keyed by the series' key. */
type LineChartDatum = Record<string, number>;

type LineChartProps = CartesianChartProps & {
    /** Called with the pressed point and the series whose line was pressed */
    onPointPress?: (dataPoint: ChartDataPoint, index: number, seriesKey: string) => void;
};

function LineChartContentBody({data, series, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onPointPress}: LineChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontManager = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);
    const [plotAreaWidth, setPlotAreaWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);

    const yAxisDomain = useDynamicYDomain(data);
    const seriesKeys = series.map((seriesItem) => seriesItem.key);
    const primarySeriesKey = seriesKeys.at(0) ?? '';
    // The primary series is drawn last so it sits over the period it is compared against.
    const seriesBackToFront = series.toReversed();
    const chartData: LineChartDatum[] = data.map((point, index) => ({
        x: index,
        ...Object.fromEntries(seriesKeys.map((key) => [key, getSeriesValue(point, key)])),
    }));

    /** Canvas y position of every series at every point, so a press can be traced back to the line under the cursor. */
    const seriesPointY = useSharedValue<number[][]>([]);

    /** The series whose dot sits closest to `cursorY` at the pressed point. */
    const resolveSeriesKey = (index: number, cursorY: number): string => {
        const distances = seriesPointY.get().map((positions) => Math.abs((positions.at(index) ?? Infinity) - cursorY));
        const closest = distances.indexOf(Math.min(...distances));
        return seriesKeys.at(closest) ?? primarySeriesKey;
    };

    const handlePointPress = (index: number, cursor: {x: number; y: number}) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onPointPress) {
            onPointPress(dataPoint, index, resolveSeriesKey(index, cursor.y));
        }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    const chartBottom = useSharedValue(0);

    const measurements = useChartLabelMeasurements(data, fontManager, variables.iconSizeExtraSmall);
    const {lineHeight, firstLabelWidth, lastLabelWidth, maxLabelWidth, labelWidths} = measurements;

    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const yAxisLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, BASE_DOMAIN_PADDING);

    const tickSpacing = plotAreaWidth > 0 && data.length > 0 ? plotAreaWidth / data.length : 0;
    const chartPaddingLeft = yAxisLabelWidth + GLYPH_PADDING;

    const domainPadding = (() => {
        if (!firstLabelWidth || !lastLabelWidth) {
            return BASE_DOMAIN_PADDING;
        }
        const labelsExceedTickSpacing = tickSpacing > 0 && maxLabelWidth + LABEL_PADDING > tickSpacing;
        let leftOverhang = firstLabelWidth / 2;
        let rightOverhang = lastLabelWidth / 2;

        if (labelsExceedTickSpacing) {
            const diagTickMax = (tickSpacing - LABEL_PADDING) / SIN_45 + lineHeight;
            leftOverhang = labelOverhang(Math.min(firstLabelWidth, diagTickMax), lineHeight, LABEL_ROTATIONS.DIAGONAL).left;
            rightOverhang = lineHeight / 2;
        }

        return {
            ...BASE_DOMAIN_PADDING,
            left: Math.max(0, leftOverhang - chartPaddingLeft),
            right: rightOverhang,
        };
    })();

    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = plotAreaWidth > 0 ? plotAreaWidth / (plotAreaWidth + totalDomainPadding) : 0;

    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth} = useChartLabelLayout({
        data,
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        tickSpacing,
        labelAreaWidth: plotAreaWidth,
        firstTickLeftSpace: boundsLeft + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - boundsRight + domainPadding.right * paddingScale : 0,
        measurements,
    });

    const originalLabels = data.map(getXAxisLabel);

    const {isCursorOverLabel, findLabelCursorX, updateTickPositions} = useLabelHitTesting({
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        truncatedLabelWidths,
        labelRotation,
        labelSkipInterval,
        chartBottom,
    });

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        setPlotAreaWidth(bounds.right - bounds.left);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
    };

    const checkIsOverDot = (args: HitTestArgs) => {
        'worklet';

        const dx = args.cursorX - args.targetX;
        const isOverDotAt = (dotY: number) => Math.sqrt(dx * dx + (args.cursorY - dotY) * (args.cursorY - dotY)) <= DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;
        const positions = seriesPointY.get();

        return positions.length > 0 ? positions.some((seriesPositions) => isOverDotAt(seriesPositions.at(args.targetIndex) ?? Infinity)) : isOverDotAt(args.targetY);
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: handlePointPress,
        checkIsOver: checkIsOverDot,
        isCursorOverLabel,
        resolveLabelTouchX: findLabelCursorX,
        chartBottom,
    });

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        updateTickPositions(xScale, data.length);
        seriesPointY.set(seriesKeys.map((key) => data.map((point) => yScale(getSeriesValue(point, key)))));
        setPointPositions(
            chartData.map((point, index) => xScale(point.x ?? index)),
            // The tooltip hangs above the topmost dot of the point, so it never covers the series below it.
            data.map((point) => Math.min(...seriesKeys.map((key) => yScale(getSeriesValue(point, key))))),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderOutside = (args: CartesianChartRenderArg<LineChartDatum, string>) => {
        const chartBoundsBottom = args.yScale(Math.min(0, ...args.yTicks, ...data.flatMap(getPointValues)));
        chartBottom.set(chartBoundsBottom);
        return (
            <>
                <LeftFrameLine
                    chartBounds={args.chartBounds}
                    yTicks={args.yTicks}
                    yScale={args.yScale}
                    color={theme.border}
                />
                {seriesBackToFront.map((seriesItem) => (
                    <ScatterPoints
                        key={seriesItem.key}
                        points={args.points[seriesItem.key] ?? []}
                        radius={DOT_RADIUS}
                        color={VictoryTheme.colors.getDarkerShade(seriesItem.color ?? VictoryTheme.colors.default)}
                    />
                ))}
                {xAxisLabelHeight !== undefined && !!fontManager && (
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
                )}
                {!!fontManager && (
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
                )}
            </>
        );
    };

    const labelSpace = VictoryTheme.axis.labelGap + (xAxisLabelHeight ?? 0);
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const chartPadding = {
        ...VictoryTheme.axis.padding,
        bottom: labelSpace + VictoryTheme.axis.padding.bottom,
        left: chartPaddingLeft,
    };

    if (isLoading || !fontManager) {
        return (
            <View style={styles.chartActivityIndicator}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <>
            <GestureDetector
                gesture={customGestures}
                touchAction="pan-y"
            >
                <Animated.View
                    style={[styles.chartContent, dynamicChartStyle, cursorStyle]}
                    onLayout={handleLayout}
                >
                    {chartWidth > 0 && (
                        <CartesianChart
                            xKey="x"
                            padding={chartPadding}
                            yKeys={seriesKeys}
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
                            {({points, yScale, yTicks}) => (
                                <>
                                    <AreaGradient
                                        points={points[primarySeriesKey] ?? []}
                                        baselineY={yScale(Math.min(...yTicks))}
                                        color={series.at(0)?.color ?? VictoryTheme.colors.default}
                                    />
                                    {seriesBackToFront.map((seriesItem) => (
                                        <Line
                                            key={seriesItem.key}
                                            points={points[seriesItem.key] ?? []}
                                            color={seriesItem.color ?? VictoryTheme.colors.default}
                                            strokeWidth={2}
                                            curveType="linear"
                                        />
                                    ))}
                                </>
                            )}
                        </CartesianChart>
                    )}
                    <ChartTooltipLayer
                        matchedIndex={matchedIndex}
                        isTooltipActive={isTooltipActive}
                        data={data}
                        series={series}
                        formatValue={formatValue}
                        chartWidth={chartWidth}
                        initialTooltipPosition={initialTooltipPosition}
                    />
                </Animated.View>
            </GestureDetector>
            <ChartLegend series={series} />
        </>
    );
}

function LineChartContent(props: LineChartProps) {
    return (
        <ChartFontsProvider>
            <LineChartContentBody {...props} />
        </ChartFontsProvider>
    );
}

export default LineChartContent;
export type {LineChartProps};
