import ActivityIndicator from '@components/ActivityIndicator';
import ActivePointIndicator from '@components/Charts/components/ActivePointIndicator';
import AreaGradient from '@components/Charts/components/AreaGradient';
import ChartGridLines from '@components/Charts/components/ChartGridLines';
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
    useScaleChangeHandler,
} from '@components/Charts/hooks';
import {getDomainPaddingForEdgeSpace, getSeriesValue, getXAxisLabel, getYAxisLabelWidth, labelOverhang} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, DASH_INTERVALS, GLYPH_PADDING, LABEL_PADDING, LABEL_ROTATIONS, SIN_45} from '@components/Charts/VictoryTheme';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';

import {DashPathEffect} from '@shopify/react-native-skia';
import React, {useState} from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {CartesianChart, Line} from 'victory-native';

import type {CartesianChartProps, ChartDataPoint} from '..';

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
    const isLastPointInProgress = !!data.at(-1)?.isInProgress;

    // A lone point has no line leading into it, so it keeps the regular line's dot instead of a dashed segment.
    const shouldDashLastSegment = isLastPointInProgress && data.length > 1;
    const chartData: LineChartDatum[] = data.map((point, index) => ({
        x: index,
        ...Object.fromEntries(seriesKeys.map((key) => [key, getSeriesValue(point, key)])),
    }));

    /** Canvas y of every series at every point */
    const seriesPointY = useSharedValue<number[][]>([]);

    /** Series whose point is closest to the cursor vertically */
    const resolveSeriesKey = (index: number, cursorY: number): string => {
        const distances = seriesPointY.get().map((positions) => Math.abs((positions.at(index) ?? Infinity) - cursorY));
        return seriesKeys.at(distances.indexOf(Math.min(...distances))) ?? primarySeriesKey;
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
    const plotTop = useSharedValue(0);
    const plotLeft = useSharedValue(0);
    const plotRight = useSharedValue(0);
    const bandHalfWidth = useSharedValue(0);

    const measurements = useChartLabelMeasurements(data, fontManager, variables.iconSizeExtraSmall);
    const {lineHeight, firstLabelWidth, lastLabelWidth, maxLabelWidth, labelWidths} = measurements;

    const {formatValue, formatCompactValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const yAxisLabelWidth = getYAxisLabelWidth(data, formatCompactValue, fontManager, variables.iconSizeExtraSmall, VictoryTheme.line.domainPadding);

    const tickSpacing = plotAreaWidth > 0 && data.length > 0 ? plotAreaWidth / data.length : 0;
    const chartPaddingRight = yAxisLabelWidth + GLYPH_PADDING;

    const domainPadding = (() => {
        if (!firstLabelWidth || !lastLabelWidth) {
            return VictoryTheme.line.domainPadding;
        }
        const labelsExceedTickSpacing = tickSpacing > 0 && maxLabelWidth + LABEL_PADDING > tickSpacing;
        let leftOverhang = firstLabelWidth / 2;
        let rightOverhang = lastLabelWidth / 2;

        if (labelsExceedTickSpacing) {
            const diagTickMax = (tickSpacing - LABEL_PADDING) / SIN_45 + lineHeight;
            leftOverhang = labelOverhang(Math.min(firstLabelWidth, diagTickMax), lineHeight, LABEL_ROTATIONS.DIAGONAL).left;
            rightOverhang = lineHeight / 2;
        }

        const edgeSpace = {
            left: Math.max(0, leftOverhang - VictoryTheme.axis.padding.left),
            right: Math.max(0, rightOverhang - chartPaddingRight - VictoryTheme.axis.labelGap),
        };
        return {...VictoryTheme.line.domainPadding, ...getDomainPaddingForEdgeSpace(edgeSpace, plotAreaWidth)};
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
        plotTop.set(bounds.top);
        plotLeft.set(bounds.left);
        plotRight.set(bounds.right);
        setPlotAreaWidth(bounds.right - bounds.left);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
    };

    const labelSpace = VictoryTheme.axis.xAxisLabelGap + (xAxisLabelHeight ?? 0);

    const isInPlotArea = (args: HitTestArgs) => {
        'worklet';

        return args.cursorX >= plotLeft.get() && args.cursorX <= plotRight.get() && args.cursorY >= plotTop.get() && args.cursorY <= args.chartBottom + labelSpace;
    };

    const checkIsOverBand = (args: HitTestArgs) => {
        'worklet';

        return isInPlotArea(args) && Math.abs(args.cursorX - args.targetX) <= bandHalfWidth.get();
    };

    const checkIsOverLabelInPlotArea = (args: HitTestArgs, activeIndex: number) => {
        'worklet';

        return isInPlotArea(args) && isCursorOverLabel(args, activeIndex);
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition, activePointPosition} = useChartInteractions({
        handlePress: handlePointPress,
        checkIsOver: checkIsOverBand,
        isCursorOverLabel: checkIsOverLabelInPlotArea,
        resolveLabelTouchX: findLabelCursorX,
        chartBottom,
    });

    const isActivePointHollow = useDerivedValue(() => isLastPointInProgress && matchedIndex.get() === data.length - 1);

    /** Stores canvas positions for hover, press and the tooltip */
    const updateHitPositions = (xScale: Scale, yScale: Scale) => {
        updateTickPositions(xScale, data.length);
        const [rangeStart, rangeEnd] = xScale.range();
        bandHalfWidth.set(data.length > 1 ? Math.abs(xScale(1) - xScale(0)) / 2 : Math.abs(rangeEnd - rangeStart));
        seriesPointY.set(seriesKeys.map((key) => data.map((point) => yScale(getSeriesValue(point, key)))));
        setPointPositions(
            chartData.map((point, index) => xScale(point.x ?? index)),
            // The hover dot and the tooltip follow the primary series.
            data.map((point) => yScale(getSeriesValue(point, primarySeriesKey))),
        );
    };

    const handleScaleChange = useScaleChangeHandler(updateHitPositions, data, series);

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderOutside = (args: CartesianChartRenderArg<LineChartDatum, string>) => {
        const chartBoundsBottom = args.chartBounds.bottom;
        chartBottom.set(chartBoundsBottom);
        const primaryPoints = args.points[primarySeriesKey] ?? [];
        const primaryColor = series.at(0)?.color ?? VictoryTheme.colors.default;

        // Only the primary series can still be collecting expenses, since the period it is compared against has ended.
        const completePrimaryPoints = shouldDashLastSegment ? primaryPoints.slice(0, -1) : primaryPoints;

        return (
            <>
                <AreaGradient
                    points={completePrimaryPoints}
                    baselineY={chartBoundsBottom}
                    color={primaryColor}
                />
                {seriesBackToFront.map((seriesItem) => (
                    <Line
                        key={seriesItem.key}
                        points={seriesItem.key === primarySeriesKey ? completePrimaryPoints : (args.points[seriesItem.key] ?? [])}
                        color={seriesItem.color ?? VictoryTheme.colors.default}
                        strokeWidth={VictoryTheme.line.strokeWidth}
                        strokeCap="round"
                        strokeJoin="round"
                        curveType="linear"
                    />
                ))}
                {shouldDashLastSegment && (
                    <Line
                        points={primaryPoints.slice(-2)}
                        color={primaryColor}
                        strokeWidth={VictoryTheme.line.strokeWidth}
                        strokeCap="round"
                        curveType="linear"
                    >
                        <DashPathEffect intervals={DASH_INTERVALS} />
                    </Line>
                )}
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
                        labelColor={theme.icon}
                        xScale={args.xScale}
                        chartBoundsBottom={chartBoundsBottom}
                    />
                )}
                {!!fontManager && (
                    <ChartYAxisLabels
                        yTicks={args.yTicks}
                        yScale={args.yScale}
                        canvasWidth={args.canvasSize.width}
                        fontSize={variables.iconSizeExtraSmall}
                        fontManager={fontManager}
                        labelColor={theme.icon}
                        formatValue={formatCompactValue}
                    />
                )}
                <ActivePointIndicator
                    position={activePointPosition}
                    isActive={isTooltipActive}
                    top={args.chartBounds.top}
                    bottom={chartBoundsBottom}
                    dotRadius={VictoryTheme.line.activeDotRadius}
                    dotColor={primaryColor}
                    guidelineColor={primaryColor}
                    guidelineOpacity={VictoryTheme.line.guidelineOpacity}
                    isHollow={isActivePointHollow}
                    hollowColor={theme.cardBG}
                />
            </>
        );
    };

    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const chartPadding = {
        ...VictoryTheme.axis.padding,
        bottom: labelSpace + VictoryTheme.axis.padding.bottom,
        right: chartPaddingRight,
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
                            // "outset" makes victory-native reserve 2 * yAxis.labelOffset below the plot for labels it
                            // doesn't draw (we render ChartXAxisLabels ourselves), on top of our own labelSpace.
                            labelPosition: 'inset',
                        }}
                        yAxis={[
                            {
                                tickCount: VictoryTheme.axis.tickCount,
                                axisSide: 'right',
                                lineWidth: 0,
                                labelOffset: VictoryTheme.axis.labelGap,
                                domain: yAxisDomain,
                            },
                        ]}
                        frame={{lineWidth: 0}}
                        data={chartData}
                    >
                        {({yScale, yTicks, chartBounds}) => (
                            <ChartGridLines
                                yTicks={yTicks}
                                yScale={yScale}
                                chartBounds={chartBounds}
                                color={theme.border}
                            />
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
