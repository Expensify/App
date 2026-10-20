import {fireEvent, render, screen} from '@testing-library/react-native';

import VictoryChartContainerFixed from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer/VictoryChartContainerFixed';
import VictoryChartContainerResponsive from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer/VictoryChartContainerResponsive';

import React from 'react';
import {View} from 'react-native';

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

jest.mock('@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext', () => ({
    useVictoryChartContext: () => ({chartContentStyles: {width: 680, height: 430}}),
}));

jest.mock('@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer/VictoryChartContainerFixed', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

const mockContainerFixed = jest.mocked(VictoryChartContainerFixed);

function renderContainer() {
    render(
        <VictoryChartContainerResponsive>
            <View testID="chart" />
        </VictoryChartContainerResponsive>,
    );
}

function fireLayout(width: number) {
    fireEvent(screen.UNSAFE_getByType(View), 'layout', {nativeEvent: {layout: {width, height: 400}}});
}

describe('VictoryChartContainerResponsive', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not mount the chart before the available width is measured', () => {
        renderContainer();

        expect(mockContainerFixed).not.toHaveBeenCalled();
    });

    it('should mount the chart already carrying the fitted scale', () => {
        renderContainer();
        fireLayout(516);

        expect(mockContainerFixed).toHaveBeenCalled();
        expect(mockContainerFixed.mock.calls.at(0)?.at(0)).toEqual(
            expect.objectContaining({
                layout: {kind: 'scaled', designWidth: 680, designHeight: 430, scale: 516 / 680},
            }),
        );
    });

    it('should mount the chart at scale 1 when the column is wider than the design width', () => {
        renderContainer();
        fireLayout(1160);

        expect(mockContainerFixed.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({layout: expect.objectContaining({scale: 1})}));
    });
});
