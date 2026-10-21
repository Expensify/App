import ActivityIndicator from '@components/ActivityIndicator';
import {BAR_CORNER_RADIUS, BAR_GROUP_INNER_GAP, BAR_HIT_GAP_RATIO, VERTICAL_BAR_DOMAIN_PADDING} from '@components/Charts/barChartConstants';
import ChartGridLines from '@components/Charts/components/ChartGridLines';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {CartesianCanvasInputs, HitTestArgs} from '@components/Charts/hooks';
import {
    useChartInteractions,
    useChartLabelFormats,
    useChartLabelLayout,
    useChartLabelMeasurements,
    useDynamicYDomain,
    useLabelHitTesting,
    useSyncPointPositions,
    useReadyCartesianCanvas,
} from '@components/Charts/hooks';
import type {ChartSeries, WrappedLabelConfig} from '@components/Charts/types';
import {getBarLayout, getCartesianPlotBounds, getXAxisLabel, getYAxisLabelWidth} from '@components/Charts/utils';
import VictoryTheme, {CARTESIAN_Y_AXIS, CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING, MAX_BAR_LABEL_LINES} from '@components/Charts/VictoryTheme';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {TupleToUnion} from 'type-fest';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';

import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {Bar, CartesianChart} from 'victory-native';

import type BarChartProps from './types';
import type {BarChartContentProps} from './types';

type VerticalBarChartCanvasProps = Omit<BarChartProps, 'isLoading'> & CartesianCanvasInputs;

function VerticalBarChartCanvas({
    data,
    series,
    yAxisUnit,
    yAxisUnitPosition = 'left',
    onBarPress,
    shouldShowLabels = true,
    shouldWrapLabels = false,
    chartWidth,
    fontManager,
}: VerticalBarChartCanvasProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const seriesKeys = series.map((seriesItem) => seriesItem.key);
    const chartData: Array<{x: number} & Record<string, number | undefined>> = data.map((point, index) => ({
        x: index,
        ...Object.fromEntries(seriesKeys.map((key) => [key, point.values[key]])),
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

    // Empty label data makes the measurement and layout hooks return early instead of laying out labels nobody sees.
    const labelData = shouldShowLabels ? data : [];
    const originalLabels = labelData.map(getXAxisLabel);

    const {formatValue, formatCompactValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const yAxisLabelWidth = getYAxisLabelWidth(data, formatCompactValue, fontManager, variables.iconSizeExtraSmall, VERTICAL_BAR_DOMAIN_PADDING);
    const chartPaddingRight = yAxisLabelWidth + GLYPH_PADDING + VictoryTheme.axis.labelGap;
    const plotBounds = getCartesianPlotBounds(chartWidth, chartPaddingRight);
    const barLayout = getBarLayout(plotBounds.width, data.length);
    const groupedBarWidth = (barLayout.barWidth - BAR_GROUP_INNER_GAP * (series.length - 1)) / series.length;

    const measurements = useChartLabelMeasurements(labelData, fontManager, variables.iconSizeExtraSmall);

    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth} = useChartLabelLayout({
        data: labelData,
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        measurements,
        tickSpacing: shouldShowLabels && plotBounds.width > 0 ? barLayout.barWidth + barLayout.gap : 0,
        // Wrapped labels are always horizontal, never skipped, and sized from wrapConfig, so the rotation/skip/truncation
        // pass is discarded. Pass 0 to short-circuit the hook, matching how the line chart skips it via labelAreaWidth.
        labelAreaWidth: shouldWrapLabels ? 0 : plotBounds.width,
        firstTickLeftSpace: plotBounds.left + barLayout.edgeSpace,
        lastTickRightSpace: chartWidth - plotBounds.right + barLayout.edgeSpace,
    });

    // Named bar labels wrap to two centered lines in the full column width, always horizontal and
    // never skipped, so they bypass the rotation/skip/single-line treatment the axis labels use.
    const labelColumnWidth = Math.min(barLayout.barWidth + barLayout.gap, plotBounds.width);
    const wrapConfig: WrappedLabelConfig | undefined =
        shouldWrapLabels && measurements.lineHeight > 0
            ? {
                  columnWidth: labelColumnWidth,
                  maxLines: MAX_BAR_LABEL_LINES,
                  lineHeight: measurements.lineHeight,
                  hasLabel: originalLabels.map((label) => label.length > 0),
                  canvasWidth: chartWidth,
              }
            : undefined;
    const wrapLabelHeight = wrapConfig ? wrapConfig.maxLines * wrapConfig.lineHeight : 0;
    // When wrapping, labelAreaWidth is 0 above so the hook returns EMPTY_LAYOUT (horizontal, skip 1).
    // xAxisLabelHeight is 0 there too, so the wrap height has to be substituted explicitly.
    const resolvedLabelHeight = shouldWrapLabels ? wrapLabelHeight : (xAxisLabelHeight ?? 0);

    const barHitHalfWidth = useSharedValue(0);
    const plotTop = useSharedValue(0);
    const plotBottom = useSharedValue(0);
    const chartBottom = useSharedValue(0);
    const yZero = useSharedValue(0);

    const {isCursorOverLabel, findLabelCursorX, updateTickPositions} = useLabelHitTesting({
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        truncatedLabelWidths,
        labelRotation,
        labelSkipInterval,
        chartBottom,
        wrapConfig,
    });

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        plotTop.set(bounds.top);
        plotBottom.set(bounds.bottom);
        yZero.set(0);
    };

    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        // The target spans the full plot height.
        const halfWidth = barHitHalfWidth.get();
        if (halfWidth === 0) {
            return false;
        }
        const isWithinX = Math.abs(args.cursorX - args.targetX) <= halfWidth;
        return isWithinX && args.cursorY >= plotTop.get() && args.cursorY <= plotBottom.get();
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition, onChartMoved, onTooltipDismiss, onChartTouchStart} =
        useChartInteractions({
            handlePress: onBarPress ? handleBarPress : undefined,
            checkIsOver: checkIsOverBar,
            isCursorOverLabel: shouldShowLabels ? isCursorOverLabel : undefined,
            resolveLabelTouchX: shouldShowLabels ? findLabelCursorX : undefined,
            chartBottom,
            yZero,
        });

    const syncPointPositions = useSyncPointPositions(data, series, setPointPositions);

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        barHitHalfWidth.set(barLayout.barWidth > 0 ? barLayout.barWidth / 2 + barLayout.gap * BAR_HIT_GAP_RATIO : 0);
        yZero.set(yScale(0));
        updateTickPositions(xScale, data.length);
        syncPointPositions(xScale, yScale);
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderBar = (point: PointsArray[number], chartBounds: ChartBounds, seriesItem: ChartSeries, seriesIndex: number) => {
        const dataPoint = data.at(Number(point.xValue));
        if (!dataPoint || typeof point.y !== 'number') {
            return null;
        }

        const pointColor = seriesIndex === 0 ? dataPoint.color : undefined;
        const color = dataPoint.seriesColors?.[seriesItem.key] ?? pointColor ?? seriesItem.color ?? VictoryTheme.colors.default;
        // Moves the bar from the group's center to the middle of its series' slot, counted from the group's left edge, so the series sit side by side
        const offset = -barLayout.barWidth / 2 + seriesIndex * (groupedBarWidth + BAR_GROUP_INNER_GAP) + groupedBarWidth / 2;

        return (
            <Bar
                key={`bar-${seriesItem.key}-${dataPoint.label}`}
                points={[{...point, x: point.x + offset}]}
                chartBounds={chartBounds}
                color={color}
                barWidth={groupedBarWidth}
                barCount={data.length}
                roundedCorners={{topLeft: BAR_CORNER_RADIUS, topRight: BAR_CORNER_RADIUS, bottomLeft: BAR_CORNER_RADIUS, bottomRight: BAR_CORNER_RADIUS}}
            />
        );
    };

    const renderOutside = (args: CartesianChartRenderArg<TupleToUnion<typeof chartData>, string>) => {
        if (xAxisLabelHeight === undefined) {
            return null;
        }

        const chartBoundsBottom = args.chartBounds.bottom;
        chartBottom.set(chartBoundsBottom);

        return (
            <>
                {shouldShowLabels && (
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
                        labelColor={theme.icon}
                        xScale={args.xScale}
                        chartBoundsBottom={chartBoundsBottom}
                        wrapConfig={wrapConfig}
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
            </>
        );
    };

    const labelSpace = shouldShowLabels ? VictoryTheme.axis.xAxisLabelGap + resolvedLabelHeight : 0;
    const chartHeight = CHART_CONTENT_MIN_HEIGHT + labelSpace;
    const chartPadding = {...VictoryTheme.axis.padding, bottom: labelSpace + VictoryTheme.axis.padding.bottom, right: chartPaddingRight};

    return (
        <GestureDetector
            gesture={customGestures}
            touchAction="pan-y"
        >
            <Animated.View
                style={[styles.chartContent, StyleUtils.getHeight(chartHeight), !!onBarPress && cursorStyle]}
                onTouchStart={onChartTouchStart}
            >
                <CartesianChart
                    explicitSize={{width: chartWidth, height: chartHeight}}
                    xKey="x"
                    padding={chartPadding}
                    yKeys={seriesKeys}
                    domain={{x: barLayout.xDomain}}
                    domainPadding={VERTICAL_BAR_DOMAIN_PADDING}
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
                    {({points, chartBounds, yScale, yTicks}) => (
                        <>
                            <ChartGridLines
                                yTicks={yTicks}
                                yScale={yScale}
                                chartBounds={chartBounds}
                                color={theme.border}
                            />
                            {groupedBarWidth > 0 &&
                                series.flatMap((seriesItem, seriesIndex) => (points[seriesItem.key] ?? []).map((point) => renderBar(point, chartBounds, seriesItem, seriesIndex)))}
                        </>
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

function VerticalBarChartContentBody({isLoading = false, chartWidth, ...canvasProps}: BarChartContentProps) {
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
        <VerticalBarChartCanvas
            {...canvasProps}
            {...readyCanvas}
        />
    );
}

export default VerticalBarChartContentBody;
