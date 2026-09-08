import type {ChartView} from '@components/Search/types';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useContainerWidth from '@hooks/useContainerWidth';
import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';
import {Circle, Path} from 'react-native-svg';

import {CHART_CONTENT_MIN_HEIGHT} from './VictoryTheme';

const CHART_SKELETON_TEST_ID = 'chartSkeleton';
const BAR_TEST_ID = 'chartSkeletonBar';
const LINE_TEST_ID = 'chartSkeletonLine';
const PIE_TEST_ID = 'chartSkeletonPie';

// Provisional shapes. Design mocks replace them.
const BAR_HEIGHT_RATIOS = [0.45, 0.72, 0.34, 0.9, 0.56, 0.78];
const BAR_GAP_RATIO = 0.25;
const LINE_POINT_RATIOS = [0.72, 0.44, 0.6, 0.24, 0.38];
const LINE_THICKNESS = 8;
const PIE_DIAMETER_RATIO = 0.72;

function renderBarShape(width: number) {
    const slotWidth = width / BAR_HEIGHT_RATIOS.length;

    return BAR_HEIGHT_RATIOS.map((ratio, index) => {
        const barHeight = CHART_CONTENT_MIN_HEIGHT * ratio;

        return (
            <SkeletonRect
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                testID={BAR_TEST_ID}
                transform={[{translateX: index * slotWidth}, {translateY: CHART_CONTENT_MIN_HEIGHT - barHeight}]}
                width={slotWidth * (1 - BAR_GAP_RATIO)}
                height={barHeight}
            />
        );
    });
}

function renderLineShape(width: number) {
    const step = width / (LINE_POINT_RATIOS.length - 1);
    const points = LINE_POINT_RATIOS.map((ratio, index) => ({x: index * step, y: CHART_CONTENT_MIN_HEIGHT * ratio}));

    // A stroked polyline would be dropped by the shimmer clip path, which reads fill geometry only.
    const topEdge = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
    const bottomEdge = points
        .slice()
        .reverse()
        .map((point) => `L${point.x},${point.y + LINE_THICKNESS}`)
        .join(' ');

    return (
        <Path
            testID={LINE_TEST_ID}
            d={`${topEdge} ${bottomEdge} Z`}
        />
    );
}

function renderPieShape(width: number) {
    const radius = (Math.min(width, CHART_CONTENT_MIN_HEIGHT) * PIE_DIAMETER_RATIO) / 2;

    return (
        <Circle
            testID={PIE_TEST_ID}
            cx={width / 2}
            cy={CHART_CONTENT_MIN_HEIGHT / 2}
            r={radius}
        />
    );
}

const SHAPE_BY_VIEW: Record<ChartView, (width: number) => ReactNode> = {
    [CONST.SEARCH.VIEW.BAR]: renderBarShape,
    [CONST.SEARCH.VIEW.LINE]: renderLineShape,
    [CONST.SEARCH.VIEW.PIE]: renderPieShape,
};

type ChartSkeletonProps = {
    /** Chart view type whose placeholder shape to draw */
    view: ChartView;
};

function ChartSkeleton({view}: ChartSkeletonProps) {
    const theme = useTheme();
    const {onLayout, containerWidth} = useContainerWidth();

    return (
        <View
            testID={CHART_SKELETON_TEST_ID}
            onLayout={onLayout}
        >
            <SkeletonViewContentLoader
                animate
                height={CHART_CONTENT_MIN_HEIGHT}
                width={containerWidth}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                {SHAPE_BY_VIEW[view](containerWidth)}
            </SkeletonViewContentLoader>
        </View>
    );
}

export default ChartSkeleton;
export {BAR_TEST_ID, CHART_SKELETON_TEST_ID, LINE_TEST_ID, PIE_TEST_ID};
