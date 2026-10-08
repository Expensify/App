import {BAR_CORNER_RADIUS, BAR_HIT_GAP_RATIO, VERTICAL_BAR_DOMAIN_PADDING} from '@components/Charts/barChartConstants';
import ChartGridLines from '@components/Charts/components/ChartGridLines';
import {useReportChartLoading} from '@components/Charts/components/ChartReveal';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs} from '@components/Charts/hooks';
import {
    useChartFontManager,
    useChartInteractions,
    useChartLabelFormats,
    useChartLabelLayout,
    useChartLabelMeasurements,
    useDynamicYDomain,
    useLabelHitTesting,
} from '@components/Charts/hooks';
import {getBarLayout, getCartesianPlotBounds, getXAxisLabel, getYAxisLabelWidth} from '@components/Charts/utils';
import {getXAxisLabelSpace} from '@components/Charts/utils/chartHeights';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING} from '@components/Charts/VictoryTheme';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {CartesianChartRenderArg, ChartBounds, PointsArray, Scale} from 'victory-native';

import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {Bar, CartesianChart} from 'victory-native';

import type {BarChartBodyProps} from './types';

function VerticalBarChartContentBody({data, isLoading = false, yAxisUnit, yAxisUnitPosition = 'left', onBarPress, shouldShowLabels = true, chartWidth}: BarChartBodyProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const fontManager = useChartFontManager();

    const chartData = data.map((point, index) => ({
        x: index,
        y: point.total,
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
    const chartPaddingRight = yAxisLabelWidth + GLYPH_PADDING;
    const plotBounds = getCartesianPlotBounds(chartWidth, chartPaddingRight);
    const barLayout = getBarLayout(plotBounds.width, data.length);

    const measurements = useChartLabelMeasurements(labelData, fontManager, variables.iconSizeExtraSmall);

    const {labelRotation, labelSkipInterval, truncatedLabelWidths, xAxisLabelHeight, regularLabelMaxWidth, firstLabelMaxWidth, lastLabelMaxWidth, ellipsisWidth} = useChartLabelLayout({
        data: labelData,
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        measurements,
        tickSpacing: shouldShowLabels && plotBounds.width > 0 ? barLayout.barWidth + barLayout.gap : 0,
        labelAreaWidth: plotBounds.width,
        firstTickLeftSpace: plotBounds.left + barLayout.edgeSpace,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - plotBounds.right + barLayout.edgeSpace : 0,
    });

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
    });

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        const domainWidth = bounds.right - bounds.left;
        const {barWidth, gap} = getBarLayout(domainWidth, data.length);
        barHitHalfWidth.set(barWidth > 0 ? barWidth / 2 + gap * BAR_HIT_GAP_RATIO : 0);
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

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: checkIsOverBar,
        isCursorOverLabel: shouldShowLabels ? isCursorOverLabel : undefined,
        resolveLabelTouchX: shouldShowLabels ? findLabelCursorX : undefined,
        chartBottom,
        yZero,
    });

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        yZero.set(yScale(0));
        updateTickPositions(xScale, data.length);
        setPointPositions(
            chartData.map((point) => xScale(point.x)),
            chartData.map((point) => yScale(point.y)),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const renderBar = (point: PointsArray[number], chartBounds: ChartBounds) => {
        const dataIndex = Number(point.xValue);
        const dataPoint = data.at(dataIndex);

        return (
            <Bar
                key={`bar-${dataPoint?.label}`}
                points={[point]}
                chartBounds={chartBounds}
                color={VictoryTheme.colors.getColor(dataIndex)}
                barWidth={barLayout.barWidth}
                barCount={data.length}
                roundedCorners={{topLeft: BAR_CORNER_RADIUS, topRight: BAR_CORNER_RADIUS, bottomLeft: BAR_CORNER_RADIUS, bottomRight: BAR_CORNER_RADIUS}}
            />
        );
    };

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        if (!fontManager || xAxisLabelHeight === undefined) {
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

    const labelSpace = shouldShowLabels ? getXAxisLabelSpace(xAxisLabelHeight) : 0;
    const chartHeight = CHART_CONTENT_MIN_HEIGHT + labelSpace;
    const chartSize = chartWidth > 0 ? {width: chartWidth, height: chartHeight} : undefined;
    const chartPadding = {...VictoryTheme.axis.padding, bottom: labelSpace + VictoryTheme.axis.padding.bottom, right: chartPaddingRight};

    const isChartLoading = isLoading || !fontManager;
    useReportChartLoading(isChartLoading);

    if (isChartLoading) {
        return null;
    }

    return (
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
                        {({points, chartBounds, yScale, yTicks}) => (
                            <>
                                <ChartGridLines
                                    yTicks={yTicks}
                                    yScale={yScale}
                                    chartBounds={chartBounds}
                                    color={theme.border}
                                />
                                {points.y.map((point) => renderBar(point, chartBounds))}
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
    );
}

export default VerticalBarChartContentBody;
