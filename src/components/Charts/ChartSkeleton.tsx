import type {ChartView} from '@components/Search/types';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useContainerWidth from '@hooks/useContainerWidth';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactElement, ReactNode} from 'react';

import React, {useId} from 'react';
import {View} from 'react-native';
import {Circle, Defs, LinearGradient, Path, Stop} from 'react-native-svg';

import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, getCartesianChartHeight} from './VictoryTheme';

const CHART_SKELETON_TEST_ID = 'chartSkeleton';
const BASELINE_TEST_ID = 'chartSkeletonBaseline';
const Y_AXIS_TEST_ID = 'chartSkeletonYAxis';
const BAR_TEST_ID = 'chartSkeletonBar';
const LINE_TEST_ID = 'chartSkeletonLine';
const MARKER_TEST_ID = 'chartSkeletonMarker';
const PIE_TEST_ID = 'chartSkeletonPie';

/** Stands in for the y-axis label column, which the loaded chart sizes from its data and the placeholder cannot. */
const Y_AXIS_GUTTER = 64;

const AXIS_THICKNESS = 1;

/**
 * CartesianChart lifts the bottom of its y range by twice the y label offset, to make room for x-axis labels of its
 * own, even though these charts draw theirs outside the plot.
 */
const Y_RANGE_BOTTOM = CHART_CONTENT_MIN_HEIGHT - VictoryTheme.axis.padding.bottom - VictoryTheme.axis.labelGap * 2;

/**
 * The y scale's `nice()` rounds the padded domain out to whole steps: one below zero, since the domain starts at zero,
 * and about ten above it. So the zero line, which the loaded chart draws as its baseline, sits one step in eleven
 * above the bottom of the range.
 */
const Y_RANGE_TYPICAL_STEPS = 11;

const LINE_SERIES = [0.12, 0.2732, 0.6575, 0.2327, 0.3302, 0.7745, 0.5831, 0.7384, 0.3981, 0.6358, 0.2378, 0.88];
const LINE_MARKER_RADIUS = 4;
const LINE_HALF_THICKNESS = 1;

/** The design rings each marker in the card color. */
const LINE_MARKER_CLEARANCE = LINE_MARKER_RADIUS + 2;

/** The same fade from the baseline up to the series line that `AreaGradient` gives the loaded chart. */
const AREA_ALPHA_BASELINE = 0.02;
const AREA_ALPHA_LINE = 0.2;

const BAR_HEIGHTS = [0.92, 0.68, 0.44, 0.2, 0.11];
const BAR_WIDTH_RATIO = 0.1431;
const BAR_PITCH_RATIO = 0.1938;
const BAR_INSET_RATIO = 0.0489;
const BAR_BORDER_RADIUS = 8;

/** Fractions of the ring, largest first, which is the order the loaded chart lays its slices out in. */
const PIE_SLICE_SHARES = [0.41, 0.214, 0.214, 0.085, 0.077];

/** The total and its caption in the middle of the ring. */
const PIE_LABEL_BARS = [
    {width: 48, offsetY: -17.5},
    {width: 72, offsetY: 6.5},
];
const PIE_LABEL_BAR_HEIGHT = 12;

/** The `mb2` under each item of the pie legend. */
const PIE_LEGEND_ITEM_MARGIN_BOTTOM = 8;

/** One row of the legend PieChartContent draws below the ring: the container's top margin, a line of `textNormal` and the item's bottom margin. */
const PIE_LEGEND_ROW_HEIGHT = variables.qrShareHorizontalPadding + variables.fontSizeNormalHeight + PIE_LEGEND_ITEM_MARGIN_BOTTOM;

type ChartSkeletonLayers = {
    /** Drawn beneath the shimmer in a paint of its own */
    chrome?: ReactElement;

    /** Becomes the shimmer's clip path, so only fill geometry counts and a stroked shape draws nothing */
    shimmer: ReactNode;
};

type PlotArea = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

type Point = {
    x: number;
    y: number;
};

function getPlotArea(width: number): PlotArea {
    const top = VictoryTheme.axis.padding.top;

    return {
        left: Y_AXIS_GUTTER,
        top,
        right: Math.max(Y_AXIS_GUTTER, width - VictoryTheme.axis.padding.right),
        bottom: Y_RANGE_BOTTOM - (Y_RANGE_BOTTOM - top) / Y_RANGE_TYPICAL_STEPS,
    };
}

type PlotLineProps = {
    plot: PlotArea;
};

const AXIS_HALF_THICKNESS = AXIS_THICKNESS / 2;

function PlotBaseline({plot}: PlotLineProps) {
    const theme = useTheme();

    return (
        <Path
            testID={BASELINE_TEST_ID}
            d={`M${plot.left - AXIS_HALF_THICKNESS} ${plot.bottom - AXIS_HALF_THICKNESS}H${plot.right}V${plot.bottom + AXIS_HALF_THICKNESS}H${plot.left - AXIS_HALF_THICKNESS}Z`}
            fill={theme.border}
        />
    );
}

function PlotYAxis({plot}: PlotLineProps) {
    const theme = useTheme();

    return (
        <Path
            testID={Y_AXIS_TEST_ID}
            d={`M${plot.left - AXIS_HALF_THICKNESS} ${plot.top}V${plot.bottom + AXIS_HALF_THICKNESS}H${plot.left + AXIS_HALF_THICKNESS}V${plot.top}Z`}
            fill={theme.border}
        />
    );
}

type LineAreaFillProps = {
    points: Point[];
    baselineY: number;
};

function LineAreaFill({points, baselineY}: LineAreaFillProps) {
    const theme = useTheme();
    const gradientId = useId();
    const first = points.at(0);
    const last = points.at(-1);

    if (!first || !last) {
        return null;
    }

    const along = points.map((point) => `L${point.x} ${point.y}`).join('');

    return (
        <>
            <Defs>
                <LinearGradient
                    id={gradientId}
                    x1="0"
                    y1="1"
                    x2="0"
                    y2="0"
                >
                    <Stop
                        offset="0"
                        stopColor={theme.skeletonLHNIn}
                        stopOpacity={AREA_ALPHA_BASELINE}
                    />
                    <Stop
                        offset="1"
                        stopColor={theme.skeletonLHNIn}
                        stopOpacity={AREA_ALPHA_LINE}
                    />
                </LinearGradient>
            </Defs>
            <Path
                d={`M${first.x} ${baselineY}${along}L${last.x} ${baselineY}Z`}
                fill={`url(#${gradientId})`}
            />
        </>
    );
}

function buildSeriesPath(points: Point[]): string {
    return points
        .map((from, index) => {
            const to = points.at(index + 1);
            if (!to) {
                return '';
            }

            const deltaX = to.x - from.x;
            const deltaY = to.y - from.y;
            const length = Math.hypot(deltaX, deltaY);

            if (length <= LINE_MARKER_CLEARANCE * 2) {
                return '';
            }

            const unitX = deltaX / length;
            const unitY = deltaY / length;
            const startX = from.x + unitX * LINE_MARKER_CLEARANCE;
            const startY = from.y + unitY * LINE_MARKER_CLEARANCE;
            const endX = to.x - unitX * LINE_MARKER_CLEARANCE;
            const endY = to.y - unitY * LINE_MARKER_CLEARANCE;
            const offsetX = -unitY * LINE_HALF_THICKNESS;
            const offsetY = unitX * LINE_HALF_THICKNESS;

            return `M${startX + offsetX} ${startY + offsetY}L${endX + offsetX} ${endY + offsetY}L${endX - offsetX} ${endY - offsetY}L${startX - offsetX} ${startY - offsetY}Z`;
        })
        .join('');
}

function renderLineShape(width: number): ChartSkeletonLayers {
    const plot = getPlotArea(width);
    const points = LINE_SERIES.map((depth, index) => ({
        x: plot.left + ((plot.right - plot.left) * index) / (LINE_SERIES.length - 1),
        y: plot.top + (plot.bottom - plot.top) * depth,
    }));

    return {
        chrome: (
            <>
                <PlotYAxis plot={plot} />
                <PlotBaseline plot={plot} />
                <LineAreaFill
                    points={points}
                    baselineY={plot.bottom}
                />
            </>
        ),
        shimmer: (
            <>
                <Path
                    testID={LINE_TEST_ID}
                    d={buildSeriesPath(points)}
                />
                {points.map((point, index) => (
                    <Circle
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        testID={MARKER_TEST_ID}
                        cx={point.x}
                        cy={point.y}
                        r={LINE_MARKER_RADIUS}
                    />
                ))}
            </>
        ),
    };
}

function renderBarShape(width: number): ChartSkeletonLayers {
    const plot = getPlotArea(width);
    const plotWidth = plot.right - plot.left;
    const plotHeight = plot.bottom - plot.top;

    return {
        chrome: <PlotBaseline plot={plot} />,
        shimmer: BAR_HEIGHTS.map((heightRatio, index) => {
            const barHeight = plotHeight * heightRatio;

            return (
                <SkeletonRect
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    testID={BAR_TEST_ID}
                    transform={[{translateX: plot.left + plotWidth * (BAR_INSET_RATIO + BAR_PITCH_RATIO * index)}, {translateY: plot.bottom - barHeight}]}
                    width={plotWidth * BAR_WIDTH_RATIO}
                    height={barHeight}
                    borderRadius={BAR_BORDER_RADIUS}
                />
            );
        }),
    };
}

function toRingPoint(centerX: number, centerY: number, radius: number, angleDegrees: number): Point {
    const angle = (angleDegrees * Math.PI) / 180;
    return {x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle)};
}

// Mirrors the geometry PieChartContent hands the loaded chart, including the gap PaddedPieSlice trims from each slice.
function renderPieShape(width: number): ChartSkeletonLayers {
    const centerX = width / 2;
    const centerY = CHART_CONTENT_MIN_HEIGHT / 2;
    const radius = Math.min(width, CHART_CONTENT_MIN_HEIGHT) / 2;
    const innerRadius = radius * VictoryTheme.pie.innerRadiusRatio;
    const {padAngle, startAngle: ringStartAngle} = VictoryTheme.pie;

    let sliceStartAngle = ringStartAngle;
    const slicePaths = PIE_SLICE_SHARES.map((share) => {
        const sweep = share * 360;
        const startAngle = sliceStartAngle + padAngle / 2;
        const endAngle = sliceStartAngle + sweep - padAngle / 2;
        sliceStartAngle += sweep;

        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        const outerStart = toRingPoint(centerX, centerY, radius, startAngle);
        const outerEnd = toRingPoint(centerX, centerY, radius, endAngle);
        const innerEnd = toRingPoint(centerX, centerY, innerRadius, endAngle);
        const innerStart = toRingPoint(centerX, centerY, innerRadius, startAngle);

        return (
            `M${outerStart.x} ${outerStart.y}A${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}` +
            `L${innerEnd.x} ${innerEnd.y}A${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}Z`
        );
    });

    return {
        shimmer: (
            <>
                {slicePaths.map((d, index) => (
                    <Path
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        testID={PIE_TEST_ID}
                        d={d}
                    />
                ))}
                {PIE_LABEL_BARS.map((bar, index) => (
                    <SkeletonRect
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        transform={[{translateX: centerX - bar.width / 2}, {translateY: centerY + bar.offsetY}]}
                        width={bar.width}
                        height={PIE_LABEL_BAR_HEIGHT}
                    />
                ))}
            </>
        ),
    };
}

// Each height is the box its chart draws into, so the box holds its size when the chart replaces the placeholder. The
// pie's box is the ring plus one legend row, left empty because the design draws no legend placeholder.
const PLACEHOLDER_BY_VIEW: Record<ChartView, {render: (width: number) => ChartSkeletonLayers; height: number}> = {
    [CONST.SEARCH.VIEW.BAR]: {render: renderBarShape, height: getCartesianChartHeight()},
    [CONST.SEARCH.VIEW.LINE]: {render: renderLineShape, height: getCartesianChartHeight()},
    [CONST.SEARCH.VIEW.PIE]: {render: renderPieShape, height: CHART_CONTENT_MIN_HEIGHT + PIE_LEGEND_ROW_HEIGHT},
};

type ChartSkeletonProps = {
    view: ChartView;
};

function ChartSkeleton({view}: ChartSkeletonProps) {
    const theme = useTheme();
    const {ref, onLayout, containerWidth} = useContainerWidth();
    const {render, height} = PLACEHOLDER_BY_VIEW[view];
    const {chrome, shimmer} = render(containerWidth);

    return (
        <View
            ref={ref}
            testID={CHART_SKELETON_TEST_ID}
            onLayout={onLayout}
        >
            <SkeletonViewContentLoader
                animate
                height={height}
                width={containerWidth}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                beforeMask={chrome}
            >
                {shimmer}
            </SkeletonViewContentLoader>
        </View>
    );
}

export default ChartSkeleton;
export {BAR_TEST_ID, BASELINE_TEST_ID, CHART_SKELETON_TEST_ID, LINE_TEST_ID, MARKER_TEST_ID, PIE_TEST_ID, Y_AXIS_TEST_ID};
