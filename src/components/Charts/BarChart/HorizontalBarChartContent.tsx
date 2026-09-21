import ActivityIndicator from '@components/ActivityIndicator';
import ChartTooltipLayer from '@components/Charts/components/ChartTooltipLayer';
import ChartYAxisLabels from '@components/Charts/components/ChartYAxisLabels';
import type {HitTestArgs, ResolveTargetIndexArgs} from '@components/Charts/hooks';
import {useChartFontManager, useChartInteractions, useChartLabelFormats, useChartParagraphs, useDynamicYDomain} from '@components/Charts/hooks';
import {findClosestPoint} from '@components/Charts/hooks/useChartInteractions';
import {calculateMinDomainPadding, getFontLineMetrics, measureTextWidth} from '@components/Charts/utils';
import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, GLYPH_PADDING, LABEL_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import type {NonUniformRRect, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';

import {Paragraph, Path, Skia} from '@shopify/react-native-skia';
import React, {useState} from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {CartesianChart} from 'victory-native';

import type {BarChartBodyProps} from './BarChartContent';

/** Extra pixel spacing between the chart boundary and the data range. `right` keeps the longest bar's tip and its tooltip off the edge. */
const BASE_DOMAIN_PADDING = {top: 8, bottom: 8, left: 0, right: 8};

/** Gap between the bar tip and the tooltip pointer, lifting the tooltip clear of the bar. */
const TOOLTIP_TIP_GAP = 4;

/** Horizontal nudge of the tooltip anchor toward the axis, so the pointer sits just inside the bar tip rather than dead-center on it. */
const TOOLTIP_TIP_OFFSET_X = 16;

/** Extra pixels past the bar tip still counted as a hover, so the rounded tip stays comfortably hoverable without extending into the empty plot space beyond it. */
const HOVER_TIP_TOLERANCE = 8;

/** Extra pixels added above and below the bar thickness for the vertical hover band, keeping thin bars easy to target without covering the whole row gap. */
const HOVER_ROW_PADDING = 6;

/** Fraction of each row reserved as gap, leaving a thin centered bar (matches the ranking design). */
const HORIZONTAL_BAR_PADDING = 0.7;

/**
 * Max tip corner radius, matching the vertical bars' 8px corners. Thin bars stay a pill because it is
 * clamped to half the thickness below; only thick bars (few rows, e.g. a single one) are capped here so
 * the tip renders rounded corners instead of a full semicircle.
 */
const BAR_TIP_RADIUS = 8;

/** Horizontal gap between the category labels and the bars. Wider than the default axis gap for readability. */
const CATEGORY_LABEL_GAP = 24;

/**
 * Builds a bar path with only the tip end rounded and the axis end square.
 * victory-native's BarGroup keys its corner flip on the y value, which for a horizontal chart is the
 * category index (never negative), so it always rounds the right end. We round per bar off the value's
 * sign instead: positive bars round the right (tip on the right of the zero axis), negative bars round the left.
 */
function buildHorizontalBarPath(x: number, y: number, width: number, height: number, radius: number, roundedTipOnRight: boolean) {
    const cornerRadius = Math.max(0, Math.min(radius, height / 2, width));
    const tip = {x: cornerRadius, y: cornerRadius};
    const flat = {x: 0, y: 0};
    const rrect: NonUniformRRect = {
        rect: {x, y, width, height},
        topLeft: roundedTipOnRight ? flat : tip,
        topRight: roundedTipOnRight ? tip : flat,
        bottomRight: roundedTipOnRight ? tip : flat,
        bottomLeft: roundedTipOnRight ? flat : tip,
    };
    const path = Skia.Path.Make();
    path.addRRect(rrect);
    return path;
}

type ValueAxisLabelsProps = {
    /** Value ticks provided by victory-native for the x-axis. */
    xTicks: number[];

    /** Maps a value tick to its x-pixel position. */
    xScale: Scale;

    /** Y-pixel coordinate of the bottom edge of the plot area. */
    chartBottom: number;

    /** Font size used for rendering labels. */
    fontSize: number;

    /** Font manager for Paragraph API rendering with multi-font fallback. */
    fontManager: SkTypefaceFontProvider;

    /** Fill color for the label text. */
    labelColor: string;

    /** Formats a numeric value to its display string. */
    formatValue: (value: number) => string;
};

/** Renders the value labels below the x-axis for a horizontal bar chart, centered on each tick. */
function ValueAxisLabels({xTicks, xScale, chartBottom, fontSize, fontManager, labelColor, formatValue}: ValueAxisLabelsProps) {
    const formattedLabels = xTicks.map((tick) => formatValue(tick));
    const paragraphs = useChartParagraphs(formattedLabels, fontManager, fontSize, labelColor, MAX_Y_AXIS_LABEL_WIDTH);
    // Text is drawn from its top-left, so the label top sits one label gap below the plot's bottom edge.
    const labelTop = chartBottom + VictoryTheme.axis.labelGap;

    // Labels are centered on their tick; when the widest one is wider than the tick spacing, show every Nth so they don't collide.
    const skipInterval = (() => {
        if (xTicks.length <= 1) {
            return 1;
        }
        let minTickSpacing = Infinity;
        for (let i = 1; i < xTicks.length; i++) {
            const gap = Math.abs(xScale(xTicks.at(i) ?? 0) - xScale(xTicks.at(i - 1) ?? 0));
            if (gap > 0) {
                minTickSpacing = Math.min(minTickSpacing, gap);
            }
        }
        const widestLabel = Math.max(0, ...paragraphs.map((item) => item.width));
        const required = widestLabel + LABEL_PADDING;
        if (!Number.isFinite(minTickSpacing) || minTickSpacing >= required) {
            return 1;
        }
        return Math.ceil(required / minTickSpacing);
    })();

    return xTicks.map((tick, i) => {
        if (i % skipInterval !== 0) {
            return null;
        }
        const paraData = paragraphs.at(i);
        if (!paraData) {
            return null;
        }
        const tickX = xScale(tick);
        return (
            <Paragraph
                key={`x-value-${tick}`}
                paragraph={paraData.para}
                x={tickX - paraData.width / 2}
                y={labelTop}
                width={paraData.width + GLYPH_PADDING}
            />
        );
    });
}

function HorizontalBarChartContentBody({data, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onBarPress}: BarChartBodyProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const fontManager = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);
    const [barAreaHeight, setBarAreaHeight] = useState(0);
    const barColor = colors.blue400;

    // Transpose: value on the x-axis, category index on the y-axis.
    // Categories are reversed (index 0 mapped to the top row) so a descending-sorted ranking reads top-to-bottom.
    const lastIndex = data.length - 1;
    const chartData = data.map((point, index) => ({
        x: point.total,
        y: lastIndex - index,
    }));

    const valueDomain = useDynamicYDomain(data);

    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

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

    const domainPadding = (() => {
        if (barAreaHeight === 0) {
            return BASE_DOMAIN_PADDING;
        }
        const verticalPadding = calculateMinDomainPadding(barAreaHeight, data.length, HORIZONTAL_BAR_PADDING);
        return {...BASE_DOMAIN_PADDING, top: verticalPadding, bottom: verticalPadding};
    })();

    const barThickness = useSharedValue(0);
    const rowHeight = useSharedValue(0);
    const xZero = useSharedValue(0);

    const handleChartBoundsChange = (bounds: ChartBounds) => {
        const plotHeight = bounds.bottom - bounds.top;
        setBarAreaHeight(plotHeight);
        barThickness.set(data.length > 0 ? (1 - HORIZONTAL_BAR_PADDING) * (plotHeight / data.length) : 0);
    };

    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        // Vertically the target is the bar thickness plus a small pad (thin bars stay easy to hit), never wider
        // than the row spacing so adjacent rows don't overlap. Using the bar thickness rather than the full row
        // gap keeps the empty space above/below a bar inert, including a single bar that spans the whole plot.
        // Horizontally the target spans the category label column on the left through the bar itself (so hovering
        // a group label also shows the tooltip), but stops at the bar tip so the plot space beyond a short bar is inert.
        // The bar runs between the zero axis and its tip; positive bars point right (tip past the axis), negative
        // bars point left (tip before the axis). Extend the tolerance outward past the tip, and always include the
        // label column at the left edge (cursorX 0) so a group label stays hoverable regardless of the bar's sign.
        const thickness = barThickness.get();
        if (thickness <= 0) {
            return false;
        }
        const band = Math.min(thickness + 2 * HOVER_ROW_PADDING, rowHeight.get());
        const rowTop = args.targetY - band / 2;
        const rowBottom = args.targetY + band / 2;
        const isWithinRow = args.cursorY >= rowTop && args.cursorY <= rowBottom;
        const zero = xZero.get();
        const tipEnd = args.targetX >= zero ? args.targetX + HOVER_TIP_TOLERANCE : args.targetX - HOVER_TIP_TOLERANCE;
        const extentStart = Math.min(0, zero, tipEnd);
        const extentEnd = Math.max(zero, tipEnd);
        const isWithinBarExtent = args.cursorX >= extentStart && args.cursorX <= extentEnd;

        return isWithinRow && isWithinBarExtent;
    };

    const resolveTargetIndex = (args: ResolveTargetIndexArgs) => {
        'worklet';

        // Categories run along the y-axis, so match the nearest point by y instead of the default nearest-by-x.
        return findClosestPoint(args.pointY, args.cursorY);
    };

    const resolveTooltipPosition = (targetX: number, targetY: number) => {
        'worklet';

        // Anchor the tooltip above the bar's tip (the data end: right for positive values, left for negative),
        // nudged slightly toward the axis so the pointer sits just inside the tip. The axis is to the left of a
        // positive tip and to the right of a negative one, so flip the nudge direction by the tip's side.
        const nudge = targetX >= xZero.get() ? -TOOLTIP_TIP_OFFSET_X : TOOLTIP_TIP_OFFSET_X;
        return {x: targetX + nudge, y: targetY - barThickness.get() / 2 - TOOLTIP_TIP_GAP};
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: handleBarPress,
        checkIsOver: checkIsOverBar,
        resolveTargetIndex,
        resolveTooltipPosition,
    });

    const handleScaleChange = (xScale: Scale, yScale: Scale) => {
        xZero.set(xScale(0));
        const oy = chartData.map((point) => yScale(point.y));
        setPointPositions(
            chartData.map((point) => xScale(point.x)),
            oy,
        );

        // Cap the hover band at the real center-to-center row spacing so adjacent rows never overlap.
        // domainPadding compresses the rows inward, so areaHeight / count would overestimate the spacing.
        // A single row has no gap to measure, so it falls back to MAX and the bar-thickness band applies as-is.
        let minGap = 0;
        for (let i = 1; i < oy.length; i++) {
            const gap = Math.abs((oy.at(i) ?? 0) - (oy.at(i - 1) ?? 0));
            minGap = minGap === 0 ? gap : Math.min(minGap, gap);
        }
        rowHeight.set(minGap > 0 ? minGap : Number.MAX_SAFE_INTEGER);
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const categoryLabelWidth = (() => {
        if (!fontManager || data.length === 0) {
            return 0;
        }
        let widest = 0;
        for (const point of data) {
            widest = Math.max(widest, measureTextWidth(point.label, fontManager, variables.iconSizeExtraSmall));
        }
        return Math.min(MAX_Y_AXIS_LABEL_WIDTH, widest);
    })();

    const {ascent, descent} = fontManager ? getFontLineMetrics(fontManager, variables.iconSizeExtraSmall) : {ascent: 0, descent: 0};
    const valueLabelHeight = ascent + descent;
    const labelSpace = VictoryTheme.axis.labelGap + valueLabelHeight;

    const renderOutside = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        if (!fontManager) {
            return null;
        }

        const chartBoundsBottom = args.chartBounds.bottom;

        return (
            <>
                <ValueAxisLabels
                    xTicks={args.xTicks}
                    xScale={args.xScale}
                    chartBottom={chartBoundsBottom}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.textSupporting}
                    formatValue={formatValue}
                />
                <ChartYAxisLabels
                    yTicks={chartData.map((point) => point.y)}
                    yScale={args.yScale}
                    chartBounds={args.chartBounds}
                    fontSize={variables.iconSizeExtraSmall}
                    fontManager={fontManager}
                    labelColor={theme.textSupporting}
                    formatValue={(yValue: number) => data.at(lastIndex - yValue)?.label ?? ''}
                    labelGap={CATEGORY_LABEL_GAP}
                    leftAlign
                    avoidOverlap
                />
            </>
        );
    };

    const dynamicChartStyle = {height: CHART_CONTENT_MIN_HEIGHT + labelSpace};
    const chartPadding = {
        ...VictoryTheme.axis.padding,
        bottom: labelSpace + VictoryTheme.axis.padding.bottom,
        left: categoryLabelWidth + CATEGORY_LABEL_GAP + GLYPH_PADDING,
    };

    // Draw each bar as its own Skia path so the rounded pill sits on the value tip and the axis end stays square,
    // for both positive (right-pointing) and negative (left-pointing) bars. thickness mirrors BarGroup's own
    // barWidth for a single series: (1 - betweenGroupPadding) * plotHeight / groupCount.
    const renderBars = (args: CartesianChartRenderArg<{x: number; y: number}, 'y'>) => {
        const plotHeight = args.chartBounds.bottom - args.chartBounds.top;
        const thickness = data.length > 0 ? (1 - HORIZONTAL_BAR_PADDING) * (plotHeight / data.length) : 0;
        if (thickness <= 0) {
            return null;
        }
        const radius = Math.min(BAR_TIP_RADIUS, thickness / 2);
        const zeroX = args.xScale(0);

        return args.points.y.map((point, index) => {
            if (typeof point.y !== 'number') {
                return null;
            }
            const tipX = point.x;
            const roundedTipOnRight = Number(point.xValue) >= 0;
            const path = buildHorizontalBarPath(Math.min(tipX, zeroX), point.y - thickness / 2, Math.abs(tipX - zeroX), thickness, radius, roundedTipOnRight);

            return (
                <Path
                    key={`horizontal-bar-${data.at(index)?.label ?? index}`}
                    path={path}
                    color={barColor}
                />
            );
        });
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
                        domain={valueDomain ? {x: valueDomain} : undefined}
                        domainPadding={domainPadding}
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
                                lineWidth: 0,
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
                />
            </Animated.View>
        </GestureDetector>
    );
}

export default HorizontalBarChartContentBody;
