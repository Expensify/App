/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- test-only: chart context and Skia mocks are narrowed from minimal literals */
import {render, screen} from '@testing-library/react-native';

import {ChartFontsContext} from '@components/Charts/context/ChartFontsContext';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext, VictoryChartProvider, VictoryChartScaledProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import Text from '@components/Text';

import type {TNode} from 'react-native-render-html';
import type {SkFont, SkTypeface} from '@shopify/react-native-skia';

import React, {Activity} from 'react';

const DESIGN_FONT_SIZE = 12;
const mockDisposeScaledFont = jest.fn();
const mockTypeface = {} as SkTypeface;

jest.mock('@components/Charts/utils/getVictoryChartTreeTypeface', () => jest.fn(() => mockTypeface));

jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Font: jest.fn((typeface: SkTypeface, size: number) => ({getSize: () => size, dispose: mockDisposeScaledFont})),
    },
}));

const mockDisposeDesignFont = jest.fn();
const designFont = {getSize: () => DESIGN_FONT_SIZE, dispose: mockDisposeDesignFont} as unknown as SkFont;

const tnode = {attributes: {width: '680', height: '340'}, children: []} as unknown as TNode;

const processedResult = {
    data: {Jan: {x: 'Jan', y1: 10}},
    xKey: 'x',
    yKeys: ['y1'],
    xAxis: {font: designFont},
    yAxis: undefined,
    domain: undefined,
    domainPadding: 20,
    padding: 16,
    isHorizontal: false,
    categories: undefined,
    labelItems: [],
    legendItems: [],
} as unknown as ProcessNodeResult;

const chartFontsValue = {typefaces: {}, fontManager: null} as unknown as ChartFontsValue;

/** Reports the size of the axis font the chart content would draw with. */
function AxisFontProbe() {
    const {xAxis} = useVictoryChartContext();
    return <Text testID="axisFontSize">{xAxis?.font?.getSize()}</Text>;
}

function ScaledChart({mode}: {mode: 'visible' | 'hidden'}) {
    return (
        <ChartFontsContext.Provider value={chartFontsValue}>
            <VictoryChartProvider
                tnode={tnode}
                processedResult={processedResult}
                type={CHART_TYPE.CARTESIAN}
            >
                <Activity mode={mode}>
                    <VictoryChartScaledProvider scale={0.5}>
                        <AxisFontProbe />
                    </VictoryChartScaledProvider>
                </Activity>
            </VictoryChartProvider>
        </ChartFontsContext.Provider>
    );
}

describe('VictoryChartScaledProvider fonts', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should keep the scaled axis fonts usable after the screen is hidden and shown again', () => {
        // Given a chart rendered at half its design size, so its axis draws with a font created for that scale
        const {rerender} = render(<ScaledChart mode="visible" />);
        expect(screen.getByTestId('axisFontSize').props.children).toBe(DESIGN_FONT_SIZE * 0.5);

        // When the screen holding the chart is hidden and shown again, which runs effect cleanups without unmounting
        rerender(<ScaledChart mode="hidden" />);
        rerender(<ScaledChart mode="visible" />);

        // Then the font the context still carries was not disposed, because the chart keeps drawing with it
        expect(mockDisposeScaledFont).not.toHaveBeenCalled();
        expect(mockDisposeDesignFont).not.toHaveBeenCalled();
    });
});
