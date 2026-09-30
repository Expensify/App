import {fireEvent, render, screen} from '@testing-library/react-native';

import BarChart from '@components/Charts/BarChart';
import {CHART_SKELETON_TEST_ID} from '@components/Charts/ChartSkeleton';
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

/** The placeholder measures its own container as well, so the box under test is the outermost ancestor handling layout. */
function getMeasuredBox() {
    let node = screen.getByTestId(CHART_SKELETON_TEST_ID).parent;
    let measuredBox = null as typeof node;

    while (node) {
        if (typeof node.props.onLayout === 'function') {
            measuredBox = node;
        }
        node = node.parent;
    }

    if (!measuredBox) {
        throw new Error('the placeholder has no ancestor reporting its layout');
    }

    return measuredBox;
}

describe('chart placeholder handover', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        ['bar', BarChart],
        ['line', LineChart],
        ['pie', PieChart],
    ])('should measure the %s chart box around its placeholder', (_name, Chart) => {
        render(
            <Chart
                data={data}
                isLoading
            />,
        );

        expect(getMeasuredBox()).toBeTruthy();
    });

    it('should hand the pie chart the width measured around its placeholder', () => {
        const {rerender} = render(
            <PieChart
                data={data}
                isLoading
            />,
        );

        fireEvent(getMeasuredBox(), 'layout', {nativeEvent: {layout: {width: CONTAINER_WIDTH, height: CHART_CONTENT_MIN_HEIGHT}}});
        rerender(
            <PieChart
                data={data}
                isLoading={false}
            />,
        );

        expect(PolarChart).toHaveBeenCalledWith(expect.objectContaining({explicitSize: {width: CONTAINER_WIDTH, height: CHART_CONTENT_MIN_HEIGHT}}), undefined);
    });

    it('should hand the pie chart no size before a width has been measured', () => {
        render(
            <PieChart
                data={data}
                isLoading={false}
            />,
        );

        expect(PolarChart).toHaveBeenCalledWith(expect.objectContaining({explicitSize: undefined}), undefined);
    });
});
