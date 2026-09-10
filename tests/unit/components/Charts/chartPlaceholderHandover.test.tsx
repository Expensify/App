import {fireEvent, render, screen} from '@testing-library/react-native';

import BarChartContent from '@components/Charts/BarChart/BarChartContent';
import {CHART_SKELETON_TEST_ID} from '@components/Charts/ChartSkeleton';
import LineChartContent from '@components/Charts/LineChart/LineChartContent';
import PieChartContent from '@components/Charts/PieChart/PieChartContent';
import type {ChartDataPoint} from '@components/Charts/types';

import React from 'react';
import {PolarChart} from 'victory-native';

const CONTAINER_WIDTH = 320;
const CONTAINER_HEIGHT = 240;

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
        ['bar', BarChartContent],
        ['line', LineChartContent],
        ['pie', PieChartContent],
    ])('should measure the %s chart box around its placeholder', (_name, ChartContent) => {
        render(
            <ChartContent
                data={data}
                isLoading
            />,
        );

        expect(getMeasuredBox()).toBeTruthy();
    });

    it('should hand the pie chart the size measured around its placeholder', () => {
        const {rerender} = render(
            <PieChartContent
                data={data}
                isLoading
            />,
        );

        fireEvent(getMeasuredBox(), 'layout', {nativeEvent: {layout: {width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT}}});
        rerender(
            <PieChartContent
                data={data}
                isLoading={false}
            />,
        );

        expect(PolarChart).toHaveBeenCalledWith(expect.objectContaining({explicitSize: {width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT}}), undefined);
    });

    it('should hand the pie chart no size before one has been measured', () => {
        render(
            <PieChartContent
                data={data}
                isLoading={false}
            />,
        );

        expect(PolarChart).toHaveBeenCalledWith(expect.objectContaining({explicitSize: undefined}), undefined);
    });
});
