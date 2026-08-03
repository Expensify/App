/* eslint-disable @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/naming-convention -- test-only: chart context mocks are narrowed from minimal literals, and per-line font maps are keyed by numeric line index */
import {render, screen} from '@testing-library/react-native';

import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext, VictoryChartProvider, VictoryChartScaledProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import type {TNode} from 'react-native-render-html';

import React from 'react';
import {Text} from 'react-native';

const tnode = {attributes: {width: '680', height: '340'}, children: []} as unknown as TNode;

const processedResult = {
    data: {Jan: {x: 'Jan', y1: 10}},
    xKey: 'x',
    yKeys: ['y1'],
    xAxis: undefined,
    yAxis: undefined,
    domain: undefined,
    domainPadding: 20,
    padding: 16,
    leftAxisLabelPadding: undefined,
    isHorizontal: false,
    categories: undefined,
    labelItems: [{x: 340, y: 24, text: 'Title', fontSize: {0: 14}}],
    legendItems: [],
} as unknown as ProcessNodeResult;

/** Serializes the parts of the context under test so assertions can read them from the rendered output. */
function ContextProbe() {
    const {padding, domainPadding, labelItems, chartContentStyles} = useVictoryChartContext();
    return <Text testID="contextProbe">{JSON.stringify({padding, domainPadding, firstLabel: labelItems.at(0), width: chartContentStyles.width, height: chartContentStyles.height})}</Text>;
}

function getProbedContext(): Record<string, unknown> {
    return JSON.parse(screen.getByTestId('contextProbe').props.children as string) as Record<string, unknown>;
}

describe('VictoryChartScaledProvider', () => {
    it('provides pixel-space values scaled by the given factor', () => {
        render(
            <VictoryChartProvider
                tnode={tnode}
                processedResult={processedResult}
                type={CHART_TYPE.CARTESIAN}
            >
                <VictoryChartScaledProvider scale={2}>
                    <ContextProbe />
                </VictoryChartScaledProvider>
            </VictoryChartProvider>,
        );

        expect(getProbedContext()).toMatchObject({
            padding: 32,
            domainPadding: 40,
            firstLabel: {x: 680, y: 48, fontSize: {0: 28}},
            width: 1360,
            height: 680,
        });
    });

    it('provides the unscaled context for scale 1', () => {
        render(
            <VictoryChartProvider
                tnode={tnode}
                processedResult={processedResult}
                type={CHART_TYPE.CARTESIAN}
            >
                <VictoryChartScaledProvider scale={1}>
                    <ContextProbe />
                </VictoryChartScaledProvider>
            </VictoryChartProvider>,
        );

        expect(getProbedContext()).toMatchObject({
            padding: 16,
            domainPadding: 20,
            firstLabel: {x: 340, y: 24},
        });
    });
});
