import {fireEvent, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import BarChart from '@components/Charts/BarChart';
import LineChart from '@components/Charts/LineChart';
import PieChart from '@components/Charts/PieChart';
import type {ChartDataPoint, ChartProps} from '@components/Charts/types';
import {CHART_CONTENT_MIN_HEIGHT} from '@components/Charts/VictoryTheme';
import {CHART_SERIES_KEY} from '@components/Search/buildChartSeries';

import React from 'react';
import {PolarChart} from 'victory-native';

const CONTAINER_WIDTH = 320;

const data: ChartDataPoint[] = [
    {label: 'Amazon', values: {[CHART_SERIES_KEY.PRIMARY]: 120}},
    {label: 'Uber', values: {[CHART_SERIES_KEY.PRIMARY]: 80}},
];

const series: ChartProps['series'] = [{key: CHART_SERIES_KEY.PRIMARY}];

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
                series={series}
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
                series={series}
                isLoading
            />,
        );

        // When it finishes loading with nothing to draw
        rerender(
            <Chart
                data={[]}
                series={series}
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
                series={series}
                isLoading
            />,
        );
        fireEvent(getMeasuredBox(), 'layout', {nativeEvent: {layout: {width: CONTAINER_WIDTH, height: CHART_CONTENT_MIN_HEIGHT}}});

        // When the data arrives
        rerender(
            <PieChart
                data={data}
                series={series}
                isLoading={false}
            />,
        );

        // Then the chart mounts with that size instead of measuring itself, which would cost it a render with no content
        expect(PolarChart).toHaveBeenCalledWith(expect.objectContaining({explicitSize: {width: CONTAINER_WIDTH, height: CHART_CONTENT_MIN_HEIGHT}}), undefined);
    });

    it('should wait for the pie chart width without a spinner when its data is already in memory', () => {
        // Given a pie chart whose box has not reported a layout yet
        // When it renders with its data
        render(
            <PieChart
                data={data}
                series={series}
                isLoading={false}
            />,
        );

        // Then the chart waits for the width instead of measuring itself, because the reveal starts the fade in the render
        // the card is measured in, and a chart that measures itself draws later than that. Nothing covers the card meanwhile,
        // since the width comes from the card's first layout and a spinner would only flash.
        expect(PolarChart).not.toHaveBeenCalled();
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('should keep the pie chart mounted when its box reports a width of 0', () => {
        // Given a pie chart that has mounted at the width measured while it was loading
        const {rerender} = render(
            <PieChart
                data={data}
                series={series}
                isLoading
            />,
        );
        const measuredBox = getMeasuredBox();
        fireEvent(measuredBox, 'layout', {nativeEvent: {layout: {width: CONTAINER_WIDTH, height: CHART_CONTENT_MIN_HEIGHT}}});
        rerender(
            <PieChart
                data={data}
                series={series}
                isLoading={false}
            />,
        );

        // When its card is hidden and the box reports a width of 0
        fireEvent(measuredBox, 'layout', {nativeEvent: {layout: {width: 0, height: 0}}});

        // Then the chart stays mounted at its last width instead of falling back to the spinner, which would drop its hover state and rebuild its canvas
        expect(screen.UNSAFE_queryByType(PolarChart)).not.toBeNull();
        expect(PolarChart).toHaveBeenLastCalledWith(expect.objectContaining({explicitSize: {width: CONTAINER_WIDTH, height: CHART_CONTENT_MIN_HEIGHT}}), undefined);
    });
});
