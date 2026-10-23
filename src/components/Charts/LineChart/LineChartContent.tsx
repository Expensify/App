import ActivityIndicator from '@components/ActivityIndicator';
import ActivePointIndicator from '@components/Charts/components/ActivePointIndicator';
import AreaGradient from '@components/Charts/components/AreaGradient';
import ChartGridLines from '@components/Charts/components/ChartGridLines';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {CartesianCanvasInputs, HitTestArgs} from '@components/Charts/hooks';
import {
    ChartFontsProvider,
    useChartInteractions,
    useChartLabelFormats,
    useChartLabelLayout,
    useChartLabelMeasurements,
    useDynamicYDomain,
    useLabelHitTesting,
    useSyncPointPositions,
    useReadyCartesianCanvas,
} from '@components/Charts/hooks';
import {getAxisLabelStep, getCartesianPlotBounds, getDomainPaddingForEdgeSpace, getLineRuns, getXAxisLabel, getYAxisLabelWidth, labelOverhang} from '@components/Charts/utils';
import type {LineRun} from '@components/Charts/utils/getLineRuns';
import VictoryTheme, {
    CARTESIAN_Y_AXIS,
    CHART_CONTENT_MIN_HEIGHT,
    DASH_INTERVALS,
    GLYPH_PADDING,
    LABEL_PADDING,
    LABEL_ROTATIONS,
    SIN_45,
    X_AXIS_LABEL_MIN_GAP,
} from '@components/Charts/VictoryTheme';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {TupleToUnion} from 'type-fest';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';

import {DashPathEffect} from '@shopify/react-native-skia';
import React from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {CartesianChart, Line} from 'victory-native';

import type {CartesianChartProps, ChartDataPoint} from '..';

type LineChartProps = CartesianChartProps & {
    onPointPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** Steps the x-axis may label points at, ascending. When set, labels stay horizontal and only every Nth point is labeled. */
    labelSteps?: readonly number[];
};

type LineChartContentProps = LineChartProps & {
    /** Null until the card has been measured. */
    chartWidth: number | null;
};

type LineChartCanvasProps = Omit<LineChartProps, 'isLoading'> & CartesianCanvasInputs;

function LineChartCanvas({data, series, yAxisUnit, yAxisUnitPosition = 'left', onPointPress, labelSteps, chartWidth, fontManager}: LineChartCanvasProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const yAxisDomain = useDynamicYDomain(data);
    const seriesKeys = series.map((seriesItem) => seriesItem.key);
    const [{key: primarySeriesKey, color: primarySeriesColor = VictoryTheme.colors.default}] = series;
    const openPointFlags = data.map((point) => !!point.isInProgress);

    // Periods that haven't ended, the current one and any later ones, are drawn dashed on the primary series, along with the segments leading into them.
    const primaryLineRuns = getLineRuns(openPointFlags);
    const chartData: Array<{x: number} & Record<string, number | undefined>> = data.map((point, index) => ({
        x: index,
        ...Object.fromEntries(seriesKeys.map((key) => [key, point.values[key]])),
    }));

    const handlePointPress = (index: number) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onPointPress) {
            onPointPress(dataPoint, index);
        }
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

    const chartPaddingRight = yAxisLabelWidth + GLYPH_PADDING + VictoryTheme.axis.labelGap;
    const {left: boundsLeft, right: boundsRight, width: plotAreaWidth} = getCartesianPlotBounds(chartWidth, chartPaddingRight);
    const tickSpacing = plotAreaWidth > 0 && data.length > 0 ? plotAreaWidth / data.length : 0;

    const domainPadding = (() => {
        if (!firstLabelWidth || !lastLabelWidth) {
            return VictoryTheme.line.domainPadding;
        }
        const labelsExceedTickSpacing = !labelSteps && tickSpacing > 0 && maxLabelWidth + LABEL_PADDING > tickSpacing;
        let leftOverhang = firstLabelWidth / 2;
        let rightOverhang = lastLabelWidth / 2;

        if (labelsExceedTickSpacing) {
            const diagTickMax = (tickSpacing - LABEL_PADDING) / SIN_45 + lineHeight;
            leftOverhang = labelOverhang(Math.min(firstLabelWidth, diagTickMax), lineHeight, LABEL_ROTATIONS.DIAGONAL).left;
            rightOverhang = lineHeight / 2;
        }

        const edgeSpace = {
            left: Math.max(0, leftOverhang - VictoryTheme.axis.padding.left),
            right: Math.max(0, rightOverhang - chartPaddingRight),
        };
        return {...VictoryTheme.line.domainPadding, ...getDomainPaddingForEdgeSpace(edgeSpace, plotAreaWidth)};
    })();

    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = plotAreaWidth > 0 ? plotAreaWidth / (plotAreaWidth + totalDomainPadding) : 0;

    const rotatingLabelLayout = useChartLabelLayout({
        data,
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        tickSpacing,
        // Stepped labels never rotate, so a zero width makes this hook return early instead of computing a rotation
        labelAreaWidth: labelSteps ? 0 : plotAreaWidth,
        firstTickLeftSpace: boundsLeft + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth - boundsRight + domainPadding.right * paddingScale,
        measurements,
    });

    const steppedLabelLayout = (() => {
        if (!labelSteps || plotAreaWidth <= 0) {
            return undefined;
        }
        const firstPointX = boundsLeft + domainPadding.left * paddingScale;
        const lastPointX = boundsRight - domainPadding.right * paddingScale;
        const pointXs = data.map((_, index) => (data.length > 1 ? firstPointX + (index * (lastPointX - firstPointX)) / (data.length - 1) : (firstPointX + lastPointX) / 2));
        const step = getAxisLabelStep({labelWidths, pointXs, steps: labelSteps, minGap: X_AXIS_LABEL_MIN_GAP});
        return {
            labelRotation: LABEL_ROTATIONS.HORIZONTAL,
            labelSkipInterval: step,
            truncatedLabelWidths: labelWidths,
            xAxisLabelHeight: lineHeight,
            regularLabelMaxWidth: Infinity,
            firstLabelMaxWidth: Infinity,
            lastLabelMaxWidth: Infinity,
            ellipsisWidth: measurements.ellipsisWidth,
        };
    })();

    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth} =
        steppedLabelLayout ?? rotatingLabelLayout;

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

    const {
        customGestures,
        setPointPositions,
        matchedIndex,
        isTooltipActive,
        isCursorOverClickable,
        initialTooltipPosition,
        activePointPosition,
        onChartMoved,
        onTooltipDismiss,
        onChartTouchStart,
    } = useChartInteractions({
        handlePress: onPointPress ? handlePointPress : undefined,
        checkIsOver: checkIsOverBand,
        isCursorOverLabel: checkIsOverLabelInPlotArea,
        resolveLabelTouchX: findLabelCursorX,
        chartBottom,
    });

    const activePointX = useDerivedValue(() => activePointPosition.get().x);
    const isActivePointHollow = useDerivedValue(() => {
        const index = matchedIndex.get();
        return index >= 0 && !!openPointFlags.at(index);
    });

    const syncPointPositions = useSyncPointPositions(data, series, setPointPositions);

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        updateTickPositions(xScale, data.length);
        const [rangeStart, rangeEnd] = xScale.range();
        bandHalfWidth.set(data.length > 1 ? Math.abs(xScale(1) - xScale(0)) / 2 : Math.abs(rangeEnd - rangeStart));
        syncPointPositions(xScale, yScale);
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderOutside = (args: CartesianChartRenderArg<TupleToUnion<typeof chartData>, string>) => {
        const chartBoundsBottom = args.chartBounds.bottom;
        chartBottom.set(chartBoundsBottom);
        const primaryPoints = args.points[primarySeriesKey] ?? [];

        return (
            <>
                {primaryLineRuns
                    .filter((run) => !run.isDashed && run.end > run.start)
                    .map((run) => (
                        <AreaGradient
                            key={`area-${run.start}`}
                            points={primaryPoints.slice(run.start, run.end + 1)}
                            baselineY={chartBoundsBottom}
                            color={primarySeriesColor}
                        />
                    ))}
                {/* Drawn last, the primary line sits on top of the compared one */}
                {[...series].reverse().map((seriesItem) => {
                    const color = seriesItem.color ?? VictoryTheme.colors.default;
                    const seriesPoints = args.points[seriesItem.key] ?? [];

                    // Only the primary series is dashed
                    const lineRuns: LineRun[] = seriesItem.key === primarySeriesKey ? primaryLineRuns : [{start: 0, end: seriesPoints.length - 1, isDashed: false}];
                    return (
                        <React.Fragment key={seriesItem.key}>
                            {lineRuns.map((run) => (
                                <Line
                                    key={`line-${run.start}`}
                                    points={seriesPoints.slice(run.start, run.end + 1)}
                                    color={color}
                                    strokeWidth={VictoryTheme.line.strokeWidth}
                                    strokeCap="round"
                                    strokeJoin="round"
                                    curveType="linear"
                                >
                                    {run.isDashed && <DashPathEffect intervals={DASH_INTERVALS} />}
                                </Line>
                            ))}
                        </React.Fragment>
                    );
                })}
                {xAxisLabelHeight !== undefined && (
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
                <ChartYAxisLabels
                    yTicks={args.yTicks}
                    yScale={args.yScale}
                    canvasWidth={args.canvasSize.width}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.icon}
                    formatValue={formatCompactValue}
                />
                <ActivePointIndicator
                    x={activePointX}
                    activeIndex={matchedIndex}
                    dots={series.map((seriesItem) => ({
                        color: seriesItem.color ?? VictoryTheme.colors.default,
                        yPositions: (args.points[seriesItem.key] ?? []).map((point) => point.y),
                    }))}
                    isActive={isTooltipActive}
                    top={args.chartBounds.top}
                    bottom={chartBoundsBottom}
                    dotRadius={VictoryTheme.line.activeDotRadius}
                    guidelineColor={primarySeriesColor}
                    guidelineOpacity={VictoryTheme.line.guidelineOpacity}
                    isHollow={isActivePointHollow}
                    hollowColor={theme.cardBG}
                />
            </>
        );
    };

    const chartHeight = CHART_CONTENT_MIN_HEIGHT + labelSpace;
    const chartPadding = {
        ...VictoryTheme.axis.padding,
        bottom: labelSpace + VictoryTheme.axis.padding.bottom,
        right: chartPaddingRight,
    };

    return (
        <GestureDetector
            gesture={customGestures}
            touchAction="pan-y"
        >
            <Animated.View
                style={[styles.chartContent, StyleUtils.getHeight(chartHeight), !!onPointPress && cursorStyle]}
                onTouchStart={onChartTouchStart}
            >
                <CartesianChart
                    explicitSize={{width: chartWidth, height: chartHeight}}
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
                    yAxis={[{...CARTESIAN_Y_AXIS, domain: yAxisDomain}]}
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
                <ChartTooltipLayer
                    matchedIndex={matchedIndex}
                    isTooltipActive={isTooltipActive}
                    data={data}
                    series={series}
                    formatValue={formatValue}
                    chartWidth={chartWidth}
                    initialTooltipPosition={initialTooltipPosition}
                    onChartMoved={onChartMoved}
                    onDismiss={onTooltipDismiss}
                />
            </Animated.View>
        </GestureDetector>
    );
}

function LineChartContentBody({isLoading = false, chartWidth, ...canvasProps}: LineChartContentProps) {
    const styles = useThemeStyles();
    const readyCanvas = useReadyCartesianCanvas(isLoading, chartWidth);

    if (!isLoading && canvasProps.data.length === 0) {
        return null;
    }

    if (!readyCanvas) {
        return (
            <View style={styles.chartActivityIndicator}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <LineChartCanvas
            {...canvasProps}
            {...readyCanvas}
        />
    );
}

function LineChartContent(props: LineChartContentProps) {
    return (
        <ChartFontsProvider>
            <LineChartContentBody {...props} />
        </ChartFontsProvider>
    );
}

export default LineChartContent;
export type {LineChartProps};
