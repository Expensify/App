import type {TNode} from 'react-native-render-html';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import parseVictoryAxisNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryAxisParser';
import parseVictoryLegendNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLegendParser';
import parseVictoryPieNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryPieParser';
import parseVictorySeriesNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victorySeriesParser';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import adjustHorizontalChartPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/adjustHorizontalChartPadding';

function createNode(tagName: string, attributes: Record<string, string> = {}, children: TNode[] = []): TNode {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal mock that only exposes the fields victory chart parsers read
    return {tagName, attributes, children} as unknown as TNode;
}

function createHorizontalChartContext(): ProcessNodeResult {
    return {
        data: {},
        xKey: 'x',
        yKeys: [],
        xAxis: undefined,
        yAxis: undefined,
        domain: undefined,
        domainPadding: undefined,
        padding: undefined,
        isHorizontal: true,
        categories: undefined,
        labelItems: [],
        legendItems: [],
    };
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
        const node = createNode('victorylegend', {
            data: "[null, 5, 'x', {name: 'A'}]",
        });
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
        const node = createNode('victorybar', {
            data: "[null, 1, {x: 'Jan', y: 10}]",
        });
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
        const node = createNode('victorypie', {
            data: "[{x: 'A', y: 1}]",
            colorscale: 'oops',
        });
        expect(() => parseVictoryPieNode(node)).not.toThrow();
    });

    it('skips non-object categories', () => {
        const node = createNode('victorypie', {
            data: "[null, 1, {x: 'A', y: 1}]",
        });
        const result = parseVictoryPieNode(node);
        expect(Object.keys(result.data ?? {})).toEqual(['A']);
    });
});

describe('victoryAxisParser', () => {
    it.each(NON_ARRAY_DATA)('does not throw when tickvalues/tickformat are non-array (%p) and the format callback is invoked', (data) => {
        const node = createNode('victoryaxis', {
            tickvalues: data,
            tickformat: data,
        });
        const result = parseVictoryAxisNode(node, null, null);
        const formatLabel = result.xAxis?.formatXLabel;
        expect(formatLabel).toBeInstanceOf(Function);
        expect(() => formatLabel?.('Jan')).not.toThrow();
        expect(formatLabel?.('Jan')).toBe('Jan');
    });

    it('derives sequential tick values from tickformat when tickvalues are omitted', () => {
        const node = createNode('victoryaxis', {
            tickformat: "['Alpha','Beta','Gamma']",
        });
        const result = parseVictoryAxisNode(node, null, createHorizontalChartContext());
        expect(result.yAxis?.at(0)?.tickValues).toEqual([0, 1, 2]);
        expect(result.yAxis?.at(0)?.tickCount).toBe(3);
        expect(result.yAxis?.at(0)?.formatYLabel?.(1)).toBe('Beta');
    });

    it('does not derive tickCount from tickformat on vertical chart category axes', () => {
        const node = createNode('victoryaxis', {
            tickformat: "['Alpha','Beta','Gamma']",
        });
        const result = parseVictoryAxisNode(node, null, null);
        expect(result.xAxis?.tickValues).toEqual([0, 1, 2]);
        expect(result.xAxis?.tickCount).toBe(0);
    });

    it('keeps explicit tickvalues when both tickvalues and tickformat are provided', () => {
        const node = createNode('victoryaxis', {
            tickvalues: '[10, 20, 30]',
            tickformat: "['A','B','C']",
        });
        const result = parseVictoryAxisNode(node, null, null);
        expect(result.xAxis?.tickValues).toEqual([10, 20, 30]);
        expect(result.xAxis?.formatXLabel?.(20)).toBe('B');
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

    it('counts multiple bar series in a grouped chart', () => {
        const tree = createNode('victorychart', {}, [
            createNode('victorygroup', {}, [createNode('victorybar', {data: '[{x: 1, y: 2}]'}), createNode('victorybar', {data: '[{x: 1, y: 3}]'})]),
        ]);
        const result = processVictoryChartTree(tree, null, null);
        expect(result.barSeriesCount).toBe(2);
    });
});

describe('adjustHorizontalChartPadding', () => {
    it('collapses left padding when built-in category labels come from tickformat-derived ticks', () => {
        const padding = adjustHorizontalChartPadding({
            data: {},
            xKey: 'x',
            yKeys: ['y'],
            xAxis: undefined,
            yAxis: [
                {
                    tickCount: 2,
                    tickValues: [0, 1],
                    labelOffset: 24,
                    font: {} as NonNullable<ProcessNodeResult['yAxis']>[number]['font'],
                },
            ],
            domain: undefined,
            domainPadding: undefined,
            padding: {left: 180, top: 92, bottom: 84, right: 32},
            isHorizontal: true,
            categories: undefined,
            labelItems: [],
            legendItems: [],
        });

        expect(padding).toMatchObject({left: 24});
    });
});
