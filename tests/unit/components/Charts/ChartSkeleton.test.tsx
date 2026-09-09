import {fireEvent, render, screen} from '@testing-library/react-native';

import ChartSkeleton, {BAR_TEST_ID, CHART_SKELETON_TEST_ID, LINE_TEST_ID, PIE_TEST_ID} from '@components/Charts/ChartSkeleton';
import {CHART_CONTENT_MIN_HEIGHT, getCartesianChartHeight} from '@components/Charts/VictoryTheme';
import type {ChartView} from '@components/Search/types';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import CONST from '@src/CONST';

import React from 'react';

const CONTAINER_WIDTH = 320;
const NARROW_CONTAINER_WIDTH = 60;

// The shapes size off the measured container, which never lays out under the test renderer, so without this every shape would draw at zero width.
function renderAtContainerWidth(view: ChartView, width = CONTAINER_WIDTH) {
    render(<ChartSkeleton view={view} />);
    fireEvent(screen.getByTestId(CHART_SKELETON_TEST_ID), 'layout', {nativeEvent: {layout: {width, height: 0}}});
}

function getSkeletonHeight() {
    return Number(screen.UNSAFE_getByType(SkeletonViewContentLoader).props.height);
}

describe('ChartSkeleton', () => {
    it('should draw a series of bars for the bar view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.BAR);

        const bars = screen.getAllByTestId(BAR_TEST_ID);

        expect(bars.length).toBeGreaterThan(1);
        expect(bars.every((bar) => Number(bar.props.width) > 0 && Number(bar.props.height) > 0)).toBe(true);
        expect(screen.queryByTestId(LINE_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(PIE_TEST_ID)).toBeNull();
    });

    it('should keep every bar drawn in a container narrower than the bar series', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.BAR, NARROW_CONTAINER_WIDTH);

        expect(screen.getAllByTestId(BAR_TEST_ID).every((bar) => Number(bar.props.width) > 0)).toBe(true);
    });

    it('should draw a polyline band for the line view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.LINE);

        expect(String(screen.getByTestId(LINE_TEST_ID).props.d)).toMatch(/^M0,[\d.]+( L[\d.]+,[\d.]+)+ Z$/);
        expect(screen.queryByTestId(BAR_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(PIE_TEST_ID)).toBeNull();
    });

    it('should draw a disc for the pie view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.PIE);

        expect(Number(screen.getByTestId(PIE_TEST_ID).props.r)).toBeGreaterThan(0);
        expect(screen.queryByTestId(BAR_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(LINE_TEST_ID)).toBeNull();
    });

    it('should reserve the x-axis label strip for the cartesian views and not for the pie view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.LINE);
        expect(getSkeletonHeight()).toBe(getCartesianChartHeight());

        screen.unmount();
        renderAtContainerWidth(CONST.SEARCH.VIEW.BAR);
        expect(getSkeletonHeight()).toBe(getCartesianChartHeight());

        screen.unmount();
        renderAtContainerWidth(CONST.SEARCH.VIEW.PIE);
        expect(getSkeletonHeight()).toBe(CHART_CONTENT_MIN_HEIGHT);
    });
});
