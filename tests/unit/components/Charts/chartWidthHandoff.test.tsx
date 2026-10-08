import {fireEvent, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import BarChart from '@components/Charts/BarChart';
import LineChart from '@components/Charts/LineChart';
import PieChart from '@components/Charts/PieChart';
import type {ChartDataPoint} from '@components/Charts/types';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import React from 'react';
import {PolarChart} from 'victory-native';

const CONTAINER_WIDTH = 320;

const data: ChartDataPoint[] = [
    {label: 'Amazon', total: 120},
    {label: 'Uber', total: 80},
];

function getMeasuredBox() {
    let node = screen.UNSAFE_getByType(ActivityIndicator).parent;

    while (node) {
        if (typeof node.props.onLayout === 'function') {
            return node;
        }
        node = node.parent;
    }

    throw new Error('the loading spinner has no ancestor reporting its layout');
}

describe('chart width handoff', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        ['bar', BarChart],
        ['line', LineChart],
    ])('should measure the %s chart width while the chart is still loading', (_name, Chart) => {
        // Given a chart whose data has not arrived yet
        const loadingChart = (
            <Chart
                data={data}
                isLoading
            />
        );

        // When it renders its loading state
        render(loadingChart);

        // Then the spinner already sits inside the box that measures the width,
        // so the width is known by the time the data arrives and the chart can be sized in the pass it mounts in
        expect(getMeasuredBox()).toBeTruthy();
    });

    it.each([
        ['bar', BarChart],
        ['line', LineChart],
        ['pie', PieChart],
    ])('should collapse the %s chart as soon as it loads with no data', (_name, Chart) => {
        // Given a loading chart
        const {rerender} = render(
            <Chart
                data={[]}
                isLoading
            />,
        );

        // When it finishes loading with nothing to draw
        rerender(
            <Chart
                data={[]}
                isLoading={false}
            />,
        );

        // Then the spinner goes in the same render, because holding it for Skia's first draw would leave it over an empty box
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('should hand the pie chart the width measured while it was loading', () => {
        // Given a loading pie chart whose box has been measured
        const {rerender} = render(
            <PieChart
                data={data}
                isLoading
            />,
        );
        fireEvent(getMeasuredBox(), 'layout', {nativeEvent: {layout: {width: CONTAINER_WIDTH, height: CHART_CONTENT_MIN_HEIGHT}}});

        // When the data arrives
        rerender(
            <PieChart
                data={data}
                isLoading={false}
            />,
        );

        // Then the chart mounts with that size instead of measuring itself, which would cost it a render with no content
        expect(PolarChart).toHaveBeenCalledWith(expect.objectContaining({explicitSize: {width: CONTAINER_WIDTH, height: CHART_CONTENT_MIN_HEIGHT}}), undefined);
    });

    it('should hand the pie chart no size before a width has been measured', () => {
        // Given a pie chart whose box has not reported a layout yet
        // When it renders with its data
        render(
            <PieChart
                data={data}
                isLoading={false}
            />,
        );

        // Then the chart is left to measure itself rather than being pinned to a zero width
        expect(PolarChart).toHaveBeenCalledWith(expect.objectContaining({explicitSize: undefined}), undefined);
    });
});
