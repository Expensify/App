/* eslint-disable @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/naming-convention, rulesdir/no-raw-typography -- test-only: chart context mocks are narrowed from minimal literals, per-line font maps are keyed by numeric line index, and the font sizes are parsed chart pixel attributes, not UI typography */
import type {VictoryChartContextValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import scaleVictoryChartContextValue from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/scaleVictoryChartContextValue';

import type {TNode} from 'react-native-render-html';

const baseValue = {
    tnode: {} as TNode,
    data: {Jan: {x: 'Jan', y1: 10}},
    xKey: 'x',
    yKeys: ['y1'],
    xAxis: {tickCount: 3, tickValues: [1, 2, 3], lineWidth: 1, labelOffset: 8, font: null},
    yAxis: [{tickCount: 4, tickValues: [0, 10, 20, 30], lineWidth: 2, labelOffset: 4, font: null}],
    domain: {y: [0, 40]},
    domainPadding: {left: 20, right: 20},
    padding: 16,
    isHorizontal: false,
    categories: undefined,
    labelItems: [{x: 340, y: 24, text: 'Title', fontSize: {0: 14}, lineHeight: {0: 1.2}}],
    legendItems: [{x: 100, y: 200, gutter: 8, symbolSpacer: 4, entries: [{text: 'A', fontSize: 12, symbolSize: 6}]}],
    chartContentStyles: {width: 680, height: 340},
    chartContainerStyles: {},
    type: 'cartesian',
    pixelScale: 1,
} as unknown as VictoryChartContextValue;

describe('scaleVictoryChartContextValue', () => {
    it('returns the same value for scale 1', () => {
        expect(scaleVictoryChartContextValue(baseValue, 1)).toBe(baseValue);
    });

    it('scales pixel-space values by the given factor', () => {
        const scaled = scaleVictoryChartContextValue(baseValue, 2);

        expect(scaled.labelItems.at(0)).toMatchObject({x: 680, y: 48, fontSize: {0: 28}});
        expect(scaled.legendItems.at(0)).toMatchObject({x: 200, y: 400, gutter: 16, symbolSpacer: 8});
        expect(scaled.legendItems.at(0)?.entries.at(0)).toMatchObject({fontSize: 24, symbolSize: 12});
        expect(scaled.padding).toBe(32);
        expect(scaled.domainPadding).toEqual({left: 40, right: 40});
        expect(scaled.chartContentStyles).toMatchObject({width: 1360, height: 680});
        expect(scaled.xAxis).toMatchObject({lineWidth: 2, labelOffset: 16});
        expect(scaled.pixelScale).toBe(2);
        expect(scaled.yAxis?.at(0)).toMatchObject({lineWidth: 4, labelOffset: 8});
    });

    it('leaves data-space values untouched', () => {
        const scaled = scaleVictoryChartContextValue(baseValue, 2);

        expect(scaled.data).toEqual(baseValue.data);
        expect(scaled.domain).toEqual(baseValue.domain);
        expect(scaled.xAxis).toMatchObject({tickCount: 3, tickValues: [1, 2, 3]});
        expect(scaled.yAxis?.at(0)).toMatchObject({tickValues: [0, 10, 20, 30]});
    });

    it('does not scale line-height multipliers', () => {
        const scaled = scaleVictoryChartContextValue(baseValue, 2);
        expect(scaled.labelItems.at(0)?.lineHeight).toEqual({0: 1.2});
    });

    it('returns axis fonts unchanged when no shared typeface is provided', () => {
        const fakeFont = {getSize: () => 12};
        const value = {...baseValue, xAxis: {...(baseValue.xAxis as Record<string, unknown>), font: fakeFont}} as unknown as typeof baseValue;
        const scaled = scaleVictoryChartContextValue(value, 2);
        expect((scaled.xAxis as Record<string, unknown>).font).toBe(fakeFont);
    });

    it('handles missing optional fields without throwing', () => {
        const value = {
            ...baseValue,
            xAxis: undefined,
            yAxis: undefined,
            domainPadding: undefined,
            padding: undefined,
            labelItems: [{x: 1, y: 2, text: 'bare'}],
            legendItems: [{x: 1, y: 2, entries: [{text: 'A'}]}],
            chartContentStyles: {},
        } as unknown as typeof baseValue;
        const scaled = scaleVictoryChartContextValue(value, 3);
        expect(scaled.labelItems.at(0)).toMatchObject({x: 3, y: 6});
        expect(scaled.legendItems.at(0)?.entries.at(0)).toMatchObject({text: 'A'});
        expect(scaled.xAxis).toBeUndefined();
        expect(scaled.padding).toBeUndefined();
    });
});
