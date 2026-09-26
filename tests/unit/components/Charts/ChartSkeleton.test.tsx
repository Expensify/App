import {fireEvent, render, screen} from '@testing-library/react-native';

import ChartSkeleton, {BAR_TEST_ID, BASELINE_TEST_ID, CHART_SKELETON_TEST_ID, LINE_TEST_ID, MARKER_TEST_ID, PIE_TEST_ID, Y_AXIS_TEST_ID} from '@components/Charts/ChartSkeleton';
import {CHART_CONTENT_MIN_HEIGHT, getCartesianChartHeight} from '@components/Charts/VictoryTheme';
import type {ChartView} from '@components/Search/types';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import CONST from '@src/CONST';

import React from 'react';

const CONTAINER_WIDTH = 320;
const NARROW_CONTAINER_WIDTH = 160;

// The shapes size off the measured container, which never lays out under the test renderer, so without this every shape would draw at zero width.
function renderAtContainerWidth(view: ChartView, width = CONTAINER_WIDTH) {
    render(<ChartSkeleton view={view} />);
    fireEvent(screen.getByTestId(CHART_SKELETON_TEST_ID), 'layout', {nativeEvent: {layout: {width, height: 0}}});
}

function getLoaderProps() {
    return screen.UNSAFE_getByType(SkeletonViewContentLoader).props;
}

type BarTransform = [{translateX: number}, {translateY: number}];

function isBarTransform(transform: unknown): transform is BarTransform {
    return Array.isArray(transform) && transform.length === 2;
}

function getBarBoxes() {
    return screen.UNSAFE_getAllByType(SkeletonRect).map(({props}) => {
        const transform: unknown = props.transform;
        if (!isBarTransform(transform)) {
            throw new Error('Bars are positioned by a translateX and a translateY');
        }
        const [{translateX}, {translateY}] = transform;
        return {left: translateX, right: translateX + Number(props.width), bottom: translateY + Number(props.height)};
    });
}

describe('ChartSkeleton', () => {
    it('should draw bars standing on one baseline with no y-axis for the bar view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.BAR);

        const bars = getBarBoxes();

        expect(bars.length).toBeGreaterThan(1);
        expect(bars.every((bar) => bar.right > bar.left)).toBe(true);
        expect(new Set(bars.map((bar) => bar.bottom)).size).toBe(1);
        expect(screen.getAllByTestId(BAR_TEST_ID)).toHaveLength(bars.length);
        expect(getLoaderProps().beforeMask).toBeDefined();
        expect(screen.getByTestId(BASELINE_TEST_ID)).toBeTruthy();
        expect(screen.queryByTestId(Y_AXIS_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(LINE_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(PIE_TEST_ID)).toBeNull();
    });

    it('should keep every bar inside the chart in a narrow container', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.BAR, NARROW_CONTAINER_WIDTH);

        expect(getBarBoxes().every((bar) => bar.right > bar.left && bar.right <= NARROW_CONTAINER_WIDTH)).toBe(true);
    });

    it('should draw the series line as filled segments with a marker at every point for the line view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.LINE);

        const line = screen.getByTestId(LINE_TEST_ID);

        expect(String(line.props.d)).toMatch(/^(M[\d. -]+(L[\d. -]+){3}Z)+$/);
        expect(line.props.stroke).toBeUndefined();
        expect(screen.getAllByTestId(MARKER_TEST_ID).length).toBeGreaterThan(1);
        expect(screen.getByTestId(BASELINE_TEST_ID)).toBeTruthy();
        expect(screen.getByTestId(Y_AXIS_TEST_ID)).toBeTruthy();
        expect(screen.queryByTestId(BAR_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(PIE_TEST_ID)).toBeNull();
    });

    it('should draw ring slices with no axes for the pie view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.PIE);

        const slices = screen.getAllByTestId(PIE_TEST_ID);

        expect(slices.length).toBeGreaterThan(1);
        expect(slices.every((slice) => /A[\d.]+ [\d.]+ 0 [01] 1 .+A[\d.]+ [\d.]+ 0 [01] 0 .+Z$/.test(String(slice.props.d)))).toBe(true);
        expect(getLoaderProps().beforeMask).toBeUndefined();
        expect(screen.queryByTestId(BASELINE_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(Y_AXIS_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(BAR_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(LINE_TEST_ID)).toBeNull();
    });

    it('should reserve the x-axis label strip for the cartesian views and a legend row for the pie view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.LINE);
        expect(Number(getLoaderProps().height)).toBe(getCartesianChartHeight());

        screen.unmount();
        renderAtContainerWidth(CONST.SEARCH.VIEW.BAR);
        expect(Number(getLoaderProps().height)).toBe(getCartesianChartHeight());

        screen.unmount();
        renderAtContainerWidth(CONST.SEARCH.VIEW.PIE);
        expect(Number(getLoaderProps().height)).toBeGreaterThan(CHART_CONTENT_MIN_HEIGHT);
    });
});
