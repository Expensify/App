/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- test-only: chart context mocks are narrowed from minimal literals */
import {render, screen} from '@testing-library/react-native';

import {ChartFontsContext} from '@components/Charts/context/ChartFontsContext';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import type {VictoryChartContainerLayout} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer/types';
import VictoryChartContainerFixed from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer/VictoryChartContainerFixed';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext, VictoryChartProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import Text from '@components/Text';

import type {ViewStyle} from 'react-native';
import type {TNode} from 'react-native-render-html';

import React from 'react';
import {StyleSheet, View} from 'react-native';

const DESIGN_WIDTH = 680;
const DESIGN_HEIGHT = 340;
const DESIGN_BORDER_RADIUS = 16;

const tnode = {attributes: {width: String(DESIGN_WIDTH), height: String(DESIGN_HEIGHT), style: `{parent: {borderRadius: ${DESIGN_BORDER_RADIUS}}}`}, children: []} as unknown as TNode;

const processedResult = {
    data: {Jan: {x: 'Jan', y1: 10}},
    xKey: 'x',
    yKeys: ['y1'],
    xAxis: undefined,
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

/** Serializes the context the chart content receives so assertions can read it from the rendered output. */
function ContextProbe() {
    const {padding, chartContentStyles, pixelScale} = useVictoryChartContext();
    return <Text testID="contextProbe">{JSON.stringify({padding, width: chartContentStyles.width, height: chartContentStyles.height, pixelScale})}</Text>;
}

function renderContainer(layout: VictoryChartContainerLayout) {
    render(
        <ChartFontsContext.Provider value={chartFontsValue}>
            <VictoryChartProvider
                tnode={tnode}
                processedResult={processedResult}
                type={CHART_TYPE.CARTESIAN}
            >
                <VictoryChartContainerFixed layout={layout}>
                    <ContextProbe />
                </VictoryChartContainerFixed>
            </VictoryChartProvider>
        </ChartFontsContext.Provider>,
    );
}

function getProbedContext(): Record<string, unknown> {
    return JSON.parse(screen.getByTestId('contextProbe').props.children as string) as Record<string, unknown>;
}

function getViewStyles(): ViewStyle[] {
    return screen.UNSAFE_getAllByType(View).map((view) => StyleSheet.flatten(view.props.style as ViewStyle) ?? {});
}

describe('VictoryChartContainerFixed', () => {
    it('should render a chart wider than its column at the fitted size instead of transforming it', () => {
        // Given a chart designed 680px wide in a column that only fits half of it
        const scale = 0.5;

        // When the container lays the chart out
        renderContainer({kind: 'scaled', designWidth: DESIGN_WIDTH, designHeight: DESIGN_HEIGHT, scale});

        // Then the chart content gets a config scaled to the fitted size, so Skia draws at the size that is painted
        expect(getProbedContext()).toMatchObject({padding: 8, width: DESIGN_WIDTH * scale, height: DESIGN_HEIGHT * scale, pixelScale: scale});

        // And no view is shrunk with a transform, which would leave the browser resampling the canvas and blur its text
        const viewStyles = getViewStyles();
        expect(viewStyles.some((style) => style.transform !== undefined)).toBe(false);
        expect(viewStyles).toContainEqual(expect.objectContaining({width: DESIGN_WIDTH * scale, height: DESIGN_HEIGHT * scale, borderRadius: DESIGN_BORDER_RADIUS * scale}));
    });

    it('should render a chart that fits its column at the design size', () => {
        // Given a column at least as wide as the chart's design width
        // When the container lays the chart out
        renderContainer({kind: 'scaled', designWidth: DESIGN_WIDTH, designHeight: DESIGN_HEIGHT, scale: 1});

        // Then the chart content keeps the design config, because there is nothing to fit
        expect(getProbedContext()).toMatchObject({padding: 16, width: DESIGN_WIDTH, height: DESIGN_HEIGHT, pixelScale: 1});
        expect(getViewStyles()).toContainEqual(expect.objectContaining({width: DESIGN_WIDTH, height: DESIGN_HEIGHT, borderRadius: DESIGN_BORDER_RADIUS}));
    });

    it('should leave an explicitly sized chart unscaled', () => {
        // Given a caller that sizes the chart itself, like the server-side renderer
        // When the container lays the chart out
        renderContainer({kind: 'fixed', width: DESIGN_WIDTH, height: DESIGN_HEIGHT});

        // Then the chart content keeps the design config
        expect(getProbedContext()).toMatchObject({padding: 16, pixelScale: 1});
    });
});
