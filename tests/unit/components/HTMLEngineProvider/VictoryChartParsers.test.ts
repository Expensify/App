import type {TNode} from '@native-html/render';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import parseVictoryAxisNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryAxisParser';
import parseVictoryLegendNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLegendParser';
import parseVictoryPieNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryPieParser';
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

describe('victoryPieParser', () => {
    it.each(NON_ARRAY_DATA)('returns empty data instead of throwing when data is %p', (data) => {
        const node = createNode('victorypie', {data});
        const result = parseVictoryPieNode(node);
        expect(result.data).toEqual({});
    });

    it('does not throw when colorscale is non-array', () => {
        const node = createNode('victorypie', {data: "[{x: 'A', y: 1}]", colorscale: 'oops'});
        expect(() => parseVictoryPieNode(node)).not.toThrow();
    });

    it('skips non-object categories', () => {
        const node = createNode('victorypie', {data: "[null, 1, {x: 'A', y: 1}]"});
        const result = parseVictoryPieNode(node);
        expect(Object.keys(result.data ?? {})).toEqual(['A']);
    });
});

describe('victoryAxisParser', () => {
    it.each(NON_ARRAY_DATA)('does not throw when tickvalues/tickformat are non-array (%p) and the format callback is invoked', (data) => {
        const node = createNode('victoryaxis', {tickvalues: data, tickformat: data});
        const result = parseVictoryAxisNode(node, null, null);
        const formatLabel = result.xAxis?.formatXLabel;
        expect(formatLabel).toBeInstanceOf(Function);
        expect(() => formatLabel?.('Jan')).not.toThrow();
        expect(formatLabel?.('Jan')).toBe('Jan');
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

    it('does not throw when a pie has non-array data', () => {
        const tree = createNode('victorychart', {}, [createNode('victorypie', {data: 'oops'})]);
        expect(() => processVictoryChartTree(tree, null, null)).not.toThrow();
    });

    it('does not throw when an axis has non-array tickvalues', () => {
        const tree = createNode('victorychart', {}, [createNode('victorybar', {data: '[{x: 1, y: 2}]'}), createNode('victoryaxis', {dependentaxis: 'true', tickvalues: 'oops'})]);
        expect(() => processVictoryChartTree(tree, null, null)).not.toThrow();
    });
});
