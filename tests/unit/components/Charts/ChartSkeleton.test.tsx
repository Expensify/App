import {fireEvent, render, screen} from '@testing-library/react-native';

import ChartSkeleton, {BAR_TEST_ID, CHART_SKELETON_TEST_ID, LINE_TEST_ID, PIE_TEST_ID} from '@components/Charts/ChartSkeleton';
import type {ChartView} from '@components/Search/types';

import CONST from '@src/CONST';

import React from 'react';

const CONTAINER_WIDTH = 320;

// The shapes are all sized off the measured container, which never lays out under the test renderer, so every
// shape would otherwise draw at zero width and the assertions would pass on an empty box.
function renderAtContainerWidth(view: ChartView) {
    render(<ChartSkeleton view={view} />);
    fireEvent(screen.getByTestId(CHART_SKELETON_TEST_ID), 'layout', {nativeEvent: {layout: {width: CONTAINER_WIDTH, height: 0}}});
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

    it('should draw a polyline band for the line view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.LINE);

        // A closed band: `M` opens the top edge, then one `L` per remaining vertex along it and one per vertex
        // back along the bottom edge.
        expect(String(screen.getByTestId(LINE_TEST_ID).props.d)).toMatch(/^M0,[\d.]+( L[\d.]+,[\d.]+){9} Z$/);
        expect(screen.queryByTestId(BAR_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(PIE_TEST_ID)).toBeNull();
    });

    it('should draw a disc for the pie view', () => {
        renderAtContainerWidth(CONST.SEARCH.VIEW.PIE);

        expect(Number(screen.getByTestId(PIE_TEST_ID).props.r)).toBeGreaterThan(0);
        expect(screen.queryByTestId(BAR_TEST_ID)).toBeNull();
        expect(screen.queryByTestId(LINE_TEST_ID)).toBeNull();
    });
});
