import type {TNode} from 'react-native-render-html';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import parseVictoryLegendNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLegendParser';
import parseVictorySeriesNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victorySeriesParser';

function createNode(tagName: string, attributes: Record<string, string> = {}, children: TNode[] = []): TNode {
    return {tagName, attributes, children} as unknown as TNode;
}

// Each value parses to a non-array (raw string, number, object) that the old `?? []` guard let through.
const NON_ARRAY_DATA = ['oops', '5', '{}'];

describe('victoryLegendParser', () => {
    it.each(NON_ARRAY_DATA)('returns empty entries instead of throwing when data is %p', (data) => {
        const node = createNode('victorylegend', {data});
        const result = parseVictoryLegendNode(node);
        expect(result.legendItems?.at(0)?.entries).toEqual([]);
    });

    it('skips non-object entries', () => {
        const node = createNode('victorylegend', {data: "[null, 5, 'x', {name: 'A'}]"});
        const result = parseVictoryLegendNode(node);
        const entries = result.legendItems?.at(0)?.entries;
        expect(entries).toHaveLength(1);
        expect(entries?.at(0)?.text).toBe('A');
    });
});

describe('victorySeriesParser', () => {
    it.each(NON_ARRAY_DATA)('returns empty data instead of throwing when data is %p', (data) => {
        const node = createNode('victorybar', {data});
        const result = parseVictorySeriesNode(node, null, null);
        expect(result.data).toEqual({});
    });

    it('skips non-object points', () => {
        const node = createNode('victorybar', {data: "[null, 1, {x: 'Jan', y: 10}]"});
        const result = parseVictorySeriesNode(node, null, null);
        expect(Object.keys(result.data ?? {})).toEqual(['Jan']);
    });
});

describe('processVictoryChartTree', () => {
    it('does not throw when a legend has non-array data (reproduces the reported crash path)', () => {
        const tree = createNode('victorychart', {}, [createNode('victorybar', {data: '[{x: 1, y: 2}]'}), createNode('victorylegend', {data: 'oops'})]);
        expect(() => processVictoryChartTree(tree, null, null)).not.toThrow();
    });

    it('does not throw when a series has non-array data', () => {
        const tree = createNode('victorychart', {}, [createNode('victorybar', {data: '{}'})]);
        expect(() => processVictoryChartTree(tree, null, null)).not.toThrow();
    });
});
