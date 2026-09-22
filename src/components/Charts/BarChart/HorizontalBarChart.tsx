import BAR_INNER_PADDING, {BAR_CORNER_RADIUS, MIN_BAR_ROW_HEIGHT} from '@components/Charts/barChartConstants';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs, ResolveTargetIndexArgs} from '@components/Charts/hooks';
import {findClosestPoint, useChartInteractions} from '@components/Charts/hooks';
import type {ChartDataPoint} from '@components/Charts/types';
import {createHorizontalBarPath, getBarColor, getFontLineMetrics, getXAxisLabel, getYAxisLabelWidth, measureTextWidth, truncateLabel} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING, LABEL_ROTATIONS, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, Scale} from 'victory-native';

import {Path} from '@shopify/react-native-skia';
import React from 'react';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {CartesianChart} from 'victory-native';

/** Largest share of the chart width the category labels may take before they are truncated */
const MAX_CATEGORY_LABEL_WIDTH_RATIO = 0.4;

/** Space (px) between the longest bar and the end of the value axis, matching the vertical chart's headroom above its tallest bar */
const VALUE_AXIS_END_PADDING = 32;

/**
 * Rows are placed on a fixed [0, 1] domain instead of [0, rowCount - 1] because victory-native always
 * rounds the y-scale domain out to "nice" values, which would stretch an arbitrary row count to a round
 * number and shift the rows off their slots.
 */
const ROW_DOMAIN: [number, number] = [0, 1];

type HorizontalBarChartProps = {
    /** Chart data points, one bar per point, listed top to bottom */
    data: ChartDataPoint[];

    /** Measured width of the chart container */
    chartWidth: number;

    /** Reports the chart container's width back to the parent */
    onLayout: (event: LayoutChangeEvent) => void;

    /** Font manager for Paragraph API rendering with multi-font fallback */
    fontManager: SkTypefaceFontProvider;

    /** Formats a value-axis tick for display */
    formatValue: (value: number) => string;

    /** Value-axis domain override (e.g. anchored at zero) */
    valueAxisDomain: [number] | undefined;

    /** Color every bar is drawn in. Left out, each bar takes a different color from the palette by rank. */
    color: string | undefined;

    /** Called with the data index of the pressed bar */
    onBarPress: (index: number) => void;

    /** Pre-measured pixel width of each category label */
    labelWidths: number[];

    /** Pixel width of the ellipsis, used to truncate long category labels */
    ellipsisWidth: number;
};

/**
 * Renders the data as horizontal bars with category labels along the y-axis. Used when the
 * category labels don't fit under vertical bars, even rotated to 45°.
 */
function HorizontalBarChart({data, chartWidth, onLayout, fontManager, formatValue, valueAxisDomain, color, onBarPress, labelWidths, ellipsisWidth}: HorizontalBarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontSize = variables.iconSizeExtraSmall;
    const rowCount = data.length;

    /** Center of the row at `index` on the row axis, with the first data point at the top */
    const getRowValue = (index: number) => 1 - (index + 0.5) / rowCount;

    const chartData = data.map((point, index) => ({
        x: point.total,
        y: getRowValue(index),
    }));

    // Category labels: rendered on the y-axis, truncated so they leave most of the width to the bars.
    const categoryLabelMaxWidth = Math.min(MAX_Y_AXIS_LABEL_WIDTH, chartWidth * MAX_CATEGORY_LABEL_WIDTH_RATIO);
    const categoryLabels = data.map((point, index) => truncateLabel(getXAxisLabel(point), labelWidths.at(index) ?? 0, categoryLabelMaxWidth, ellipsisWidth));
    const categoryLabelWidth = Math.max(0, ...categoryLabels.map((label) => measureTextWidth(label, fontManager, fontSize)));
    const categoryTicks = data.map((_, index) => getRowValue(index));

    // Value labels: rendered below the plot, centered on each x tick.
    const {ascent, descent} = getFontLineMetrics(fontManager, fontSize);
    const valueLabelSpace = VictoryTheme.axis.labelGap + ascent + descent;
    const valueLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, fontSize, {top: 0, bottom: 0});

    const chartPadding = {
        ...VictoryTheme.axis.padding,
        left: categoryLabelWidth + GLYPH_PADDING + VictoryTheme.axis.labelGap,
        // Value labels are centered on their ticks, and the last tick can sit on the plot's right edge.
        right: Math.max(VictoryTheme.axis.padding.right, valueLabelWidth / 2),
        bottom: VictoryTheme.axis.padding.bottom + valueLabelSpace,
    };
    const domainPadding = {top: 0, bottom: 0, left: 0, right: VALUE_AXIS_END_PADDING};

    // Grow with the number of rows so every category stays legible. The surrounding page scrolls.
    const chartHeight = Math.max(CHART_CONTENT_MIN_HEIGHT, rowCount * MIN_BAR_ROW_HEIGHT + chartPadding.top + chartPadding.bottom);
    const rowHeight = (chartHeight - chartPadding.top - chartPadding.bottom) / rowCount;
    const barThickness = (1 - BAR_INNER_PADDING) * rowHeight;

    const xZero = useSharedValue(0);

    /** Hovering a bar or its category label shows the tooltip */
    const checkIsOverRow = (args: HitTestArgs) => {
        'worklet';

        const barRight = Math.max(args.targetX, xZero.get());
        return Math.abs(args.cursorY - args.targetY) <= barThickness / 2 && args.cursorX >= 0 && args.cursorX <= barRight;
    };

    /** Only the bar itself is pressable */
    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        const currentXZero = xZero.get();
        const barLeft = Math.min(args.targetX, currentXZero);
        const barRight = Math.max(args.targetX, currentXZero);
        return Math.abs(args.cursorY - args.targetY) <= barThickness / 2 && args.cursorX >= barLeft && args.cursorX <= barRight;
    };

    /** Rows are stacked vertically, so match the cursor to the nearest row by Y */
    const findNearestRow = ({cursorY, pointY}: ResolveTargetIndexArgs) => {
        'worklet';

        return findClosestPoint(pointY, cursorY);
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: onBarPress,
        checkIsOver: checkIsOverRow,
        checkIsClickable: checkIsOverBar,
        resolveTargetIndex: findNearestRow,
        xZero,
        tooltipPlacement: 'right',
    });

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        xZero.set(xScale(0));
        setPointPositions(
            chartData.map((point) => xScale(point.x)),
            chartData.map((point) => yScale(point.y)),
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    // Bars are drawn from `data` rather than victory's `points`, because victory sorts numeric x values
    // (here: the totals), so `points` would no longer line up with the data indices used for colors.
    const renderBars = ({xScale, yScale}: CartesianChartRenderArg<{x: number; y: number}, 'y'>) =>
        data.map((dataPoint, index) => (
            <Path
                key={`bar-${dataPoint.label}`}
                path={createHorizontalBarPath(xScale(dataPoint.total), yScale(getRowValue(index)), xScale(0), barThickness, BAR_CORNER_RADIUS)}
                color={getBarColor(color, index)}
            />
        ));

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => (
        <>
            <ChartYAxisLabels
                yTicks={categoryTicks}
                labels={categoryLabels}
                yScale={args.yScale}
                chartBounds={args.chartBounds}
                fontSize={fontSize}
                fontManager={fontManager}
                labelColor={theme.textSupporting}
            />
            <ChartXAxisLabels
                labels={args.xTicks.map(formatValue)}
                // Value labels are never truncated (all max widths are Infinity), so their widths aren't needed.
                labelWidths={[]}
                regularLabelMaxWidth={Infinity}
                firstLabelMaxWidth={Infinity}
                lastLabelMaxWidth={Infinity}
                ellipsisWidth={ellipsisWidth}
                labelRotation={LABEL_ROTATIONS.HORIZONTAL}
                labelSkipInterval={1}
                fontSize={fontSize}
                fontManager={fontManager}
                labelColor={theme.textSupporting}
                xScale={(index) => args.xScale(args.xTicks.at(index) ?? 0)}
                chartBoundsBottom={args.chartBounds.bottom}
            />
        </>
    );

    return (
        <GestureDetector
            gesture={customGestures}
            touchAction="pan-y"
        >
            <Animated.View
                style={[styles.chartContent, {height: chartHeight}, cursorStyle]}
                onLayout={onLayout}
            >
                {chartWidth > 0 && (
                    <CartesianChart
                        xKey="x"
                        yKeys={['y']}
                        padding={chartPadding}
                        domain={{x: valueAxisDomain, y: ROW_DOMAIN}}
                        domainPadding={domainPadding}
                        onScaleChange={handleScaleChange}
                        renderOutside={renderOutside}
                        xAxis={{
                            tickCount: VictoryTheme.axis.tickCount,
                            lineWidth: VictoryTheme.axis.yLineWidth,
                            lineColor: theme.border,
                        }}
                        yAxis={[
                            {
                                // Category labels are drawn by ChartYAxisLabels. Setting 0 ticks also stops victory reserving space for its own.
                                tickCount: 0,
                                lineWidth: VictoryTheme.axis.xLineWidth,
                            },
                        ]}
                        frame={{lineWidth: 0}}
                        data={chartData}
                    >
                        {renderBars}
                    </CartesianChart>
                )}
                <ChartTooltipLayer
                    matchedIndex={matchedIndex}
                    isTooltipActive={isTooltipActive}
                    data={data}
                    formatValue={formatValue}
                    chartWidth={chartWidth}
                    initialTooltipPosition={initialTooltipPosition}
                    placement="right"
                />
            </Animated.View>
        </GestureDetector>
    );
}

export default HorizontalBarChart;
