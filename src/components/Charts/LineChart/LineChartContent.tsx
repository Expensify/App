import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';
import {CartesianChart, Line} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import LeftFrameLine from '@components/Charts/components/LeftFrameLine';
import ScatterPoints from '@components/Charts/components/ScatterPoints';
import {AXIS_LABEL_GAP, CHART_CONTENT_MIN_HEIGHT, CHART_PADDING, GLYPH_PADDING, X_AXIS_LINE_WIDTH, Y_AXIS_LINE_WIDTH, Y_AXIS_TICK_COUNT} from '@components/Charts/constants';
import type {ComputeGeometryFn, HitTestArgs} from '@components/Charts/hooks';
import {useChartFontManager, useChartInteractions, useChartLabelFormats, useChartLabelLayout, useDynamicYDomain, useLabelHitTesting, useTooltipData} from '@components/Charts/hooks';
import type {CartesianChartProps, ChartDataPoint} from '@components/Charts/types';
import {calculateMinDomainPadding, DEFAULT_CHART_COLOR, getAdditionalOffset, getNiceUpperBound, measureTextWidth, rotatedLabelYOffset} from '@components/Charts/utils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';

/** Inner dot radius for line chart data points */
const DOT_RADIUS = 6;

/** Extra hover area beyond the dot radius for easier touch targeting */
const DOT_HOVER_EXTRA_RADIUS = 2;

/** Minimum safe padding to avoid clipping labels/points */
const MIN_SAFE_PADDING = DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;

/** Base domain padding applied to all sides */
const BASE_DOMAIN_PADDING = {top: 16, bottom: 16, left: 0, right: 0};

/**
 * Line chart geometry for label hit-testing.
 * Labels are start-anchored at the tick: the 45° parallelogram's upper-right corner is
 * offset by (iconSize/3 * sinA) left and down, placing the box just below the axis line.
 */
const computeLineLabelGeometry: ComputeGeometryFn = ({ascent, descent, sinA, angleRad, labelWidths, padding}) => {
    const iconThirdSin = (variables.iconSizeExtraSmall / 3) * sinA;
    const additionalOffset = getAdditionalOffset(angleRad);
    return {
        labelYOffset: AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad) - additionalOffset,
        iconSin: variables.iconSizeExtraSmall * sinA,
        labelSins: labelWidths.map((w) => w * sinA),
        halfWidths: labelWidths.map((w) => w / 2),
        cornerAnchorDX: labelWidths.map(() => -iconThirdSin),
        cornerAnchorDY: labelWidths.map(() => iconThirdSin),
        yMin90Offsets: labelWidths.map(() => padding),
        yMax90Offsets: labelWidths.map((w) => w + padding),
    };
};

type LineChartProps = CartesianChartProps & {
    /** Callback when a data point is pressed */
    onPointPress?: (dataPoint: ChartDataPoint, index: number) => void;
};

function LineChartContent({data, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onPointPress}: LineChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontMgr = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);
    const [plotAreaWidth, setPlotAreaWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);

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

    const handleLayout = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    const chartBottom = useSharedValue(0);

    const domainPadding = (() => {
        if (chartWidth === 0 || data.length === 0) {
            return BASE_DOMAIN_PADDING;
        }

        const geometricPadding = calculateMinDomainPadding(chartWidth, data.length);

        if (!fontMgr) {
            return {...BASE_DOMAIN_PADDING, left: geometricPadding, right: geometricPadding};
        }

        const firstLabelWidth = measureTextWidth(data.at(0)?.label ?? '', fontMgr, variables.iconSizeExtraSmall);
        const lastLabelWidth = measureTextWidth(data.at(-1)?.label ?? '', fontMgr, variables.iconSizeExtraSmall);

        const firstLabelNeeds = firstLabelWidth / 2;
        const lastLabelNeeds = lastLabelWidth / 2;

        const wastedLeft = geometricPadding - firstLabelNeeds;
        const wastedRight = geometricPadding - lastLabelNeeds;
        const reclaimablePadding = Math.min(wastedLeft, wastedRight);

        if (reclaimablePadding <= 0) {
            return {...BASE_DOMAIN_PADDING, left: geometricPadding, right: geometricPadding};
        }

        const horizontalPadding = Math.max(geometricPadding - reclaimablePadding, MIN_SAFE_PADDING);
        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding};
    })();

    const tickSpacing = plotAreaWidth > 0 && data.length > 0 ? plotAreaWidth / data.length : 0;

    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = plotAreaWidth > 0 ? plotAreaWidth / (plotAreaWidth + totalDomainPadding) : 0;

    const {labelRotation, labelSkipInterval, truncatedLabels, xAxisLabelHeight} = useChartLabelLayout({
        data,
        fontMgr,
        fontSize: variables.iconSizeExtraSmall,
        tickSpacing,
        labelAreaWidth: plotAreaWidth,
        firstTickLeftSpace: boundsLeft + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - boundsRight + domainPadding.right * paddingScale : 0,
        allowTightDiagonalPacking: true,
    });

    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const {isCursorOverLabel, findLabelCursorX, updateTickPositions} = useLabelHitTesting({
        fontMgr,
        fontSize: variables.iconSizeExtraSmall,
        truncatedLabels,
        labelRotation,
        labelSkipInterval,
        chartBottom,
        computeGeometry: computeLineLabelGeometry,
    });

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        setPlotAreaWidth(bounds.right - bounds.left);
        setBoundsLeft(bounds.left);
        setBoundsRight(bounds.right);
        chartBottom.set(bounds.bottom);
    };

    const checkIsOverDot = (args: HitTestArgs) => {
        'worklet';

        const dx = args.cursorX - args.targetX;
        const dy = args.cursorY - args.targetY;
        return Math.sqrt(dx * dx + dy * dy) <= DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS;
    };

    const {customGestures, setPointPositions, activeDataIndex, isTooltipActive, isOverClickableTarget, initialTooltipPosition} = useChartInteractions({
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

    const tooltipData = useTooltipData(activeDataIndex, data, formatValue);

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
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
                {xAxisLabelHeight !== undefined && !!fontMgr && (
                    <ChartXAxisLabels
                        labels={truncatedLabels}
                        labelRotation={labelRotation}
                        labelSkipInterval={labelSkipInterval}
                        fontSize={variables.iconSizeExtraSmall}
                        fontMgr={fontMgr}
                        labelColor={theme.textSupporting}
                        xScale={args.xScale}
                        chartBoundsBottom={args.chartBounds.bottom}
                    />
                )}
                {!!fontMgr && (
                    <ChartYAxisLabels
                        yTicks={args.yTicks}
                        yScale={args.yScale}
                        chartBounds={args.chartBounds}
                        fontSize={variables.iconSizeExtraSmall}
                        fontMgr={fontMgr}
                        labelColor={theme.textSupporting}
                        formatValue={formatValue}
                        leftAlign
                    />
                )}
            </>
        );
    };

    const labelSpace = AXIS_LABEL_GAP + (xAxisLabelHeight ?? 0);
    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const maxYAxisTickValue = getNiceUpperBound(Math.max(...data.map((p) => Math.abs(p.total)), 0), Y_AXIS_TICK_COUNT);
    const yAxisLabelWidth = fontMgr ? measureTextWidth(formatValue(maxYAxisTickValue), fontMgr, variables.iconSizeExtraSmall) : 0;
    const chartPadding = {...CHART_PADDING, bottom: labelSpace + CHART_PADDING.bottom + variables.iconSizeExtraSmall, left: yAxisLabelWidth + GLYPH_PADDING / 2};

    if (isLoading || !fontMgr) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'LineChartContent', isLoading, isFontLoading: !fontMgr};
        return (
            <View style={styles.chartActivityIndicator}>
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
        <GestureDetector gesture={customGestures}>
            <View
                style={[styles.chartContent, dynamicChartStyle, isOverClickableTarget && styles.cursorPointer]}
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
        </GestureDetector>
    );
}

export default LineChartContent;
export type {LineChartProps};
