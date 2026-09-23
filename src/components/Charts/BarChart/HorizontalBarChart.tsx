import BAR_INNER_PADDING, {BAR_CORNER_RADIUS, MIN_BAR_ROW_HEIGHT} from '@components/Charts/barChartConstants';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartXAxisLabels from '@components/Charts/components/ChartXAxisLabels';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs, ResolveTargetIndexArgs} from '@components/Charts/hooks';
import {findClosestPoint, useChartInteractions} from '@components/Charts/hooks';
import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import {createHorizontalBarPath, getBarColor, getFontLineMetrics, getSeriesValue, getXAxisLabel, getYAxisLabelWidth, measureTextWidth, truncateLabel} from '@components/Charts/utils';
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

/** Gap between the bars of one row, as a share of a bar's thickness */
const BAR_WITHIN_GROUP_PADDING = 0.1;

type HorizontalBarChartProps = {
    /** Chart data points, one row of bars per point, listed top to bottom */
    data: ChartDataPoint[];

    /** The plotted series, one bar of every row each */
    series: ChartSeries[];

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

    /** Called with the data index of the pressed bar and the series it belongs to */
    onBarPress: (index: number, seriesKey: string) => void;

    /** Pre-measured pixel width of each category label */
    labelWidths: number[];

    /** Pixel width of the ellipsis, used to truncate long category labels */
    ellipsisWidth: number;
};

/**
 * Renders the data as horizontal bars with category labels along the y-axis. Used when the
 * category labels don't fit under vertical bars, even rotated to 45°.
 */
function HorizontalBarChart({data, series, chartWidth, onLayout, fontManager, formatValue, valueAxisDomain, onBarPress, labelWidths, ellipsisWidth}: HorizontalBarChartProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontSize = variables.iconSizeExtraSmall;
    const rowCount = data.length;

    /** Center of the row at `index` on the row axis, with the first data point at the top */
    const getRowValue = (index: number) => 1 - (index + 0.5) / rowCount;

    const seriesKeys = series.map((seriesItem) => seriesItem.key);
    const primarySeriesKey = seriesKeys.at(0) ?? '';
    // Every series contributes a point, so the value axis spans all of them even though the bars are drawn by hand below.
    const chartData = data.flatMap((point, index) => seriesKeys.map((key) => ({x: getSeriesValue(point, key), y: getRowValue(index)})));

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
    const chartHeight = Math.max(CHART_CONTENT_MIN_HEIGHT, rowCount * series.length * MIN_BAR_ROW_HEIGHT + chartPadding.top + chartPadding.bottom);
    const rowHeight = (chartHeight - chartPadding.top - chartPadding.bottom) / rowCount;
    // A row is split into one slot per series, each bar leaving a gap to the next.
    const groupThickness = (1 - BAR_INNER_PADDING) * rowHeight;
    const slotThickness = groupThickness / series.length;
    // A lone bar fills its row; grouped bars leave a gap to the next.
    const barThickness = series.length > 1 ? slotThickness * (1 - BAR_WITHIN_GROUP_PADDING) : slotThickness;

    /** Distance from the row's center to the center of the series' own bar */
    const getSeriesOffset = (seriesIndex: number) => (seriesIndex - (series.length - 1) / 2) * slotThickness;

    /** The series whose bar sits under `cursorY`, resolved from the row's top edge */
    const resolveSeriesKey = (rowCenterY: number, cursorY: number): string => {
        const seriesIndex = Math.min(series.length - 1, Math.max(0, Math.floor((cursorY - (rowCenterY - groupThickness / 2)) / slotThickness)));
        return seriesKeys.at(seriesIndex) ?? primarySeriesKey;
    };

    /** Canvas y position of each row's center, so a press can be traced back to the bar under the cursor */
    const rowCenters = useSharedValue<number[]>([]);

    const handleBarPress = (index: number, cursor: {x: number; y: number}) => {
        onBarPress(index, resolveSeriesKey(rowCenters.get().at(index) ?? cursor.y, cursor.y));
    };

    const xZero = useSharedValue(0);

    /** Hovering a bar or its category label shows the tooltip */
    const checkIsOverRow = (args: HitTestArgs) => {
        'worklet';

        const barRight = Math.max(args.targetX, xZero.get());
        return Math.abs(args.cursorY - args.targetY) <= groupThickness / 2 && args.cursorX >= 0 && args.cursorX <= barRight;
    };

    /** Only the bar itself is pressable */
    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        const currentXZero = xZero.get();
        const barLeft = Math.min(args.targetX, currentXZero);
        const barRight = Math.max(args.targetX, currentXZero);
        return Math.abs(args.cursorY - args.targetY) <= groupThickness / 2 && args.cursorX >= barLeft && args.cursorX <= barRight;
    };

    /** Rows are stacked vertically, so match the cursor to the nearest row by Y */
    const findNearestRow = ({cursorY, pointY}: ResolveTargetIndexArgs) => {
        'worklet';

        return findClosestPoint(pointY, cursorY);
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: checkIsOverRow,
        checkIsClickable: checkIsOverBar,
        resolveTargetIndex: findNearestRow,
        xZero,
        tooltipPlacement: 'right',
    });

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        xZero.set(xScale(0));
        const centers = data.map((_, index) => yScale(getRowValue(index)));
        rowCenters.set(centers);
        setPointPositions(
            // The tooltip hangs off the longest bar of the row, so it clears every series.
            data.map((point) => Math.max(...seriesKeys.map((key) => xScale(getSeriesValue(point, key))))),
            centers,
        );
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    // Bars are drawn from `data` rather than victory's `points`, because victory sorts numeric x values
    // (here: the totals), so `points` would no longer line up with the data indices used for colors.
    const renderBars = ({xScale, yScale}: CartesianChartRenderArg<{x: number; y: number}, 'y'>) =>
        data.flatMap((dataPoint, index) =>
            series.map((seriesItem, seriesIndex) => (
                <Path
                    key={`bar-${dataPoint.label}-${seriesItem.key}`}
                    path={createHorizontalBarPath(
                        xScale(getSeriesValue(dataPoint, seriesItem.key)),
                        yScale(getRowValue(index)) + getSeriesOffset(seriesIndex),
                        xScale(0),
                        barThickness,
                        BAR_CORNER_RADIUS,
                    )}
                    color={series.length > 1 ? (seriesItem.color ?? VictoryTheme.colors.default) : getBarColor(seriesItem.color, index)}
                />
            )),
        );

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
                    series={series}
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
