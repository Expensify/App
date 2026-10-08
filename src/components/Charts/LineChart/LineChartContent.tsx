import AreaGradient from '@components/Charts/components/AreaGradient';
import ChartGridLines from '@components/Charts/components/ChartGridLines';
import ChartReveal from '@components/Charts/components/ChartReveal';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
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
import {getCartesianChartHeight, getCartesianPlotBounds, getDomainPaddingForEdgeSpace, getXAxisLabel, getXAxisLabelSpace, getYAxisLabelWidth, labelOverhang} from '@components/Charts/utils';
import VictoryTheme, {GLYPH_PADDING, LABEL_PADDING, LABEL_ROTATIONS, SIN_45} from '@components/Charts/VictoryTheme';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {CartesianChartRenderArg, Scale} from 'victory-native';

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

type LineChartProps = CartesianChartProps & {
    onPointPress?: (dataPoint: ChartDataPoint, index: number) => void;
};

type LineChartContentProps = LineChartProps & {
    chartWidth: number;
};

function LineChartContentBody({data, isLoading = false, yAxisUnit, yAxisUnitPosition = 'left', onPointPress, chartWidth}: LineChartContentProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const fontManager = useChartFontManager();

    const yAxisDomain = useDynamicYDomain(data);
    const chartData = data.map((point, index) => ({
        x: index,
        y: point.total,
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

    const measurements = useChartLabelMeasurements(data, fontManager, variables.iconSizeExtraSmall);
    const {lineHeight, firstLabelWidth, lastLabelWidth, maxLabelWidth, labelWidths} = measurements;

    const {formatValue, formatCompactValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const yAxisLabelWidth = getYAxisLabelWidth(data, formatCompactValue, fontManager, variables.iconSizeExtraSmall, BASE_DOMAIN_PADDING);

    const chartPaddingRight = yAxisLabelWidth + GLYPH_PADDING;
    const {left: boundsLeft, right: boundsRight, width: plotAreaWidth} = getCartesianPlotBounds(chartWidth, chartPaddingRight);
    const tickSpacing = plotAreaWidth > 0 && data.length > 0 ? plotAreaWidth / data.length : 0;

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

        const edgeSpace = {
            left: Math.max(0, leftOverhang - VictoryTheme.axis.padding.left),
            right: Math.max(0, rightOverhang - chartPaddingRight - VictoryTheme.axis.labelGap),
        };
        return {...BASE_DOMAIN_PADDING, ...getDomainPaddingForEdgeSpace(edgeSpace, plotAreaWidth)};
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

    const checkIsOverDot = (args: HitTestArgs) => {
        'worklet';

        const dx = args.cursorX - args.targetX;
        const dy = args.cursorY - args.targetY;
        return Math.sqrt(dx * dx + dy * dy) <= DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;
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
        setPointPositions(
            chartData.map((point) => xScale(point.x)),
            chartData.map((point) => yScale(point.y)),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        const chartBoundsBottom = args.yScale(Math.min(...args.yTicks));
        chartBottom.set(chartBoundsBottom);
        return (
            <>
                <ScatterPoints
                    points={args.points.y}
                    radius={DOT_RADIUS}
                    color={VictoryTheme.colors.defaultDot}
                />
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
            </>
        );
    };

    const labelSpace = getXAxisLabelSpace(xAxisLabelHeight);
    const chartHeight = getCartesianChartHeight(xAxisLabelHeight);
    const chartSize = chartWidth > 0 ? {width: chartWidth, height: chartHeight} : undefined;
    const chartPadding = {
        ...VictoryTheme.axis.padding,
        bottom: labelSpace + VictoryTheme.axis.padding.bottom,
        right: chartPaddingRight,
    };

    const isChartLoading = isLoading || !fontManager;

    if (!isChartLoading && data.length === 0) {
        return null;
    }

    return (
        <ChartReveal
            isLoading={isChartLoading}
            loadingHeight={getCartesianChartHeight()}
        >
            <GestureDetector
                gesture={customGestures}
                touchAction="pan-y"
            >
                <Animated.View style={[styles.chartContent, StyleUtils.getHeight(chartHeight), cursorStyle]}>
                    {!!chartSize && (
                        <CartesianChart
                            explicitSize={chartSize}
                            xKey="x"
                            padding={chartPadding}
                            yKeys={['y']}
                            domainPadding={domainPadding}
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
                            {({points, yScale, yTicks, chartBounds}) => (
                                <>
                                    <ChartGridLines
                                        yTicks={yTicks}
                                        yScale={yScale}
                                        chartBounds={chartBounds}
                                        color={theme.border}
                                    />
                                    <AreaGradient
                                        points={points.y}
                                        baselineY={yScale(Math.min(...yTicks))}
                                        color={VictoryTheme.colors.default}
                                    />
                                    <Line
                                        points={points.y}
                                        color={VictoryTheme.colors.default}
                                        strokeWidth={2}
                                        curveType="linear"
                                    />
                                </>
                            )}
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
        </ChartReveal>
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
