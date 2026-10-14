/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- test-only: chart context mocks are narrowed from minimal literals */
import {render} from '@testing-library/react-native';

import VictoryChartExpandModal from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartExpandModal';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {VictoryChartProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import CONST from '@src/CONST';

import type {TNode} from 'react-native-render-html';

import React from 'react';

jest.mock('@hooks/useKeyboardShortcut');
// Render the modal's children directly — the Escape subscription under test lives in the chart modal, not in Modal.
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => () => null);
// The chart body renders a Skia canvas, which is out of scope here.
jest.mock('@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartExpandedContent', () => () => null);
jest.mock('@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContent', () => () => null);

const mockUseKeyboardShortcut = jest.mocked(useKeyboardShortcut);

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
    labelItems: [],
    legendItems: [],
} as unknown as ProcessNodeResult;

function renderModal(isVisible: boolean) {
    const onClose = jest.fn();
    render(
        <VictoryChartProvider
            tnode={tnode}
            processedResult={processedResult}
            type={CHART_TYPE.CARTESIAN}
        >
            <VictoryChartExpandModal
                isVisible={isVisible}
                onClose={onClose}
            />
        </VictoryChartProvider>,
    );
    return onClose;
}

function getEscapeShortcut() {
    const call = mockUseKeyboardShortcut.mock.calls.find((registered) => registered[0] === CONST.KEYBOARD_SHORTCUTS.ESCAPE);
    return {callback: call?.[1], config: call?.[2]};
}

describe('VictoryChartExpandModal', () => {
    beforeEach(() => {
        mockUseKeyboardShortcut.mockClear();
    });

    it('closes on Escape keydown while visible, like the attachment viewer', () => {
        const onClose = renderModal(true);

        const {callback, config} = getEscapeShortcut();
        expect(config?.isActive).toBe(true);
        expect(config?.shouldBubble).toBe(true);

        callback?.();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not handle Escape while hidden, so a mounted-but-closed modal never swallows it', () => {
        renderModal(false);

        expect(getEscapeShortcut().config?.isActive).toBe(false);
    });
});
