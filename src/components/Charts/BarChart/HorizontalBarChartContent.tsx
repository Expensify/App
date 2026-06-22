import React, {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';
import {CartesianChart} from 'victory-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ChartCategoryYAxisLabels from '@components/Charts/components/ChartCategoryYAxisLabels';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import HorizontalBarSeries from '@components/Charts/components/HorizontalBarSeries';
import BAR_INNER_PADDING, {HORIZONTAL_CHART_TOP_PADDING, HORIZONTAL_ROW_HEIGHT} from '@components/Charts/barChartConstants';
import type {HitTestArgs} from '@components/Charts/hooks';
import {
    useChartFontManager,
    useChartInteractions,
    useChartLabelFormats,
    useChartLabelMeasurements,
    useDynamicYDomain,
} from '@components/Charts/hooks';
import {getFontLineMetrics, measureTextWidth, truncateLabel} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import type {CartesianChartProps, ChartDataPoint} from '..';

const BASE_DOMAIN_PADDING = {top: 16, bottom: 16, left: 0, right: 16};

type HorizontalBarChartContentProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;
    useSingleColor?: boolean;
};

function HorizontalBarChartContent({data, isLoading, yAxisUnit, yAxisUnitPosition = 'left', useSingleColor = false, onBarPress}: HorizontalBarChartContentProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontMgr = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const defaultBarColor = VictoryTheme.colors.default;
    const fontSize = variables.iconSizeExtraSmall;

    const chartData = data.map((point, index) => ({
        x: point.total,
        y: index,
    }));

    const valueAxisDomain = useDynamicYDomain(data);
    const chartDomain = {
        y: [-0.5, data.length - 0.5] as [number, number],
        ...(valueAxisDomain ? {x: valueAxisDomain} : {}),
    };
    const measurements = useChartLabelMeasurements(data, fontMgr, fontSize);
    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const categoryLabelWidth =
        !fontMgr || data.length === 0
            ? 0
            : Math.max(
                  ...data.map((point, index) => {
                      const labelWidth = measurements.labelWidths.at(index) ?? 0;
                      const truncated = truncateLabel(point.label, labelWidth, MAX_Y_AXIS_LABEL_WIDTH, measurements.ellipsisWidth);
                      return measureTextWidth(truncated, fontMgr, fontSize);
                  }),
              );

    const lineMetrics = fontMgr ? getFontLineMetrics(fontMgr, fontSize) : {ascent: 0, descent: 0};
    const valueAxisLabelHeight = lineMetrics.ascent + lineMetrics.descent;
    const categoryLabels = data.map((point) => point.label);
    const chartContentHeight = Math.max(CHART_CONTENT_MIN_HEIGHT, data.length * HORIZONTAL_ROW_HEIGHT);
    const dynamicChartStyle = {height: chartContentHeight + valueAxisLabelHeight + VictoryTheme.axis.labelGap + VictoryTheme.axis.padding.bottom};
    const chartPadding = {
        ...VictoryTheme.axis.padding,
        left: categoryLabelWidth + VictoryTheme.axis.labelGap + GLYPH_PADDING,
        bottom: valueAxisLabelHeight + VictoryTheme.axis.labelGap + VictoryTheme.axis.padding.bottom,
        top: VictoryTheme.axis.padding.top + HORIZONTAL_CHART_TOP_PADDING,
    };

    const barHeight = useSharedValue(0);
    const xZero = useSharedValue(0);

    const handleBarPress = (index: number) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onBarPress) {
            onBarPress(dataPoint, index);
        }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        const rowHeight = (bounds.bottom - bounds.top) / Math.max(1, data.length);
        barHeight.set(rowHeight * (1 - BAR_INNER_PADDING));
        setBoundsLeft(bounds.left);
    };

    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        const currentBarHeight = barHeight.get();
        const currentXZero = xZero.get();
        if (currentBarHeight === 0) {
            return false;
        }

        const barLeft = Math.min(currentXZero, args.targetX);
        const barRight = Math.max(currentXZero, args.targetX);
        const barTop = args.targetY - currentBarHeight / 2;
        const barBottom = args.targetY + currentBarHeight / 2;

        return args.cursorX >= barLeft && args.cursorX <= barRight && args.cursorY >= barTop && args.cursorY <= barBottom;
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: checkIsOverBar,
        matchIndexByY: true,
    });

    const handleScaleChange = (scaleX: Scale, scaleY: Scale) => {
        xZero.set(scaleX(0));
        setPointPositions(
            chartData.map((point) => scaleX(point.x)),
            chartData.map((point) => scaleY(point.y)),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const getBarColor = (index: number) => (useSingleColor ? defaultBarColor : VictoryTheme.colors.getColor(index));

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => (
        <>
            <ChartCategoryYAxisLabels
                labels={categoryLabels}
                labelWidths={measurements.labelWidths}
                ellipsisWidth={measurements.ellipsisWidth}
                fontSize={fontSize}
                fontMgr={fontMgr}
                labelColor={theme.textSupporting}
                yScale={args.yScale}
                labelRightX={boundsLeft > 0 ? boundsLeft : args.chartBounds.left}
            />
            <ChartYAxisLabels
                placement="bottom"
                ticks={args.xTicks}
                tickScale={args.xScale}
                chartBoundsBottom={args.chartBounds.bottom}
                fontSize={fontSize}
                fontMgr={fontMgr}
                labelColor={theme.textSupporting}
                formatValue={formatValue}
            />
        </>
    );

    if (isLoading || !fontMgr) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'HorizontalBarChartContent', isLoading, isFontLoading: !fontMgr};
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
            <Animated.View
                style={[styles.chartContent, dynamicChartStyle, cursorStyle]}
                onLayout={handleLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        padding={chartPadding}
                        yKeys={['y']}
                        domain={chartDomain}
                        domainPadding={BASE_DOMAIN_PADDING}
                        onChartBoundsChange={handleChartBoundsChange}
                        onScaleChange={handleScaleChange}
                        renderOutside={renderOutside}
                        xAxis={{
                            tickCount: VictoryTheme.axis.tickCount,
                            lineWidth: VictoryTheme.axis.yLineWidth,
                            lineColor: theme.border,
                        }}
                        yAxis={[
                            {
                                tickCount: data.length,
                                lineWidth: VictoryTheme.axis.xLineWidth,
                            },
                        ]}
                        frame={{lineWidth: 0}}
                        data={chartData}
                    >
                        {({points, chartBounds, xScale}) => (
                            <HorizontalBarSeries
                                points={points.y}
                                chartBounds={chartBounds}
                                xScale={xScale}
                                getBarColor={getBarColor}
                                barCount={data.length}
                            />
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

export default HorizontalBarChartContent;
export type {HorizontalBarChartContentProps};
