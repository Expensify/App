import type {TNode} from 'react-native-render-html';
import {buildBarTooltipEntries} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/buildBarTooltipEntries';
import getBarTooltipKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getBarTooltipKey';

function createMockBarNode(data: string, labels?: string, barwidth?: string): TNode {
    return {
        tagName: 'victorybar',
        attributes: {
            data,
            ...(labels ? {labels} : {}),
            ...(barwidth ? {barwidth} : {}),
        },
    } as unknown as TNode;
}

describe('buildBarTooltipEntries', () => {
    it('uses explicit labels when provided', () => {
        const tnode = createMockBarNode('[{x: 1.13, y: 4500}, {x: 2.13, y: 3200}]', "['Jan 2025: $4,500', 'Feb 2025: $3,200']");
        const {entries} = buildBarTooltipEntries({tnode, yKey: 'y1', isHorizontal: false});

        expect(entries).toHaveLength(2);
        expect(entries.at(0)).toMatchObject({
            key: getBarTooltipKey('y1', 1.13),
            label: 'Jan 2025: $4,500',
            total: 4500,
            isLabelOnly: true,
        });
        expect(entries.at(1)).toMatchObject({
            key: getBarTooltipKey('y1', 2.13),
            label: 'Feb 2025: $3,200',
            total: 3200,
            isLabelOnly: true,
        });
    });

    it('falls back to a formatted amount when labels are missing', () => {
        const tnode = createMockBarNode('[{x: 3, y: 1200}]');
        const {entries} = buildBarTooltipEntries({tnode, yKey: 'y2', isHorizontal: false});

        expect(entries).toHaveLength(1);
        expect(entries.at(0)).toMatchObject({
            key: getBarTooltipKey('y2', 3),
            label: '$1,200',
            total: 1200,
            isLabelOnly: false,
        });
    });

    it('adds category index aliases for horizontal charts', () => {
        const tnode = createMockBarNode("[{x: 'Alice', y: 5000}, {x: 'Bob', y: 3000}]");
        const categories = ['Alice', 'Bob', 'Carol'];
        const {entries} = buildBarTooltipEntries({tnode, yKey: 'y3', isHorizontal: true, categories});

        expect(entries.at(0)?.key).toBe(getBarTooltipKey('y3', 'Alice'));
        expect(entries.at(0)?.keyAliases).toEqual([getBarTooltipKey('y3', 0)]);
        expect(entries.at(1)?.keyAliases).toEqual([getBarTooltipKey('y3', 1)]);
    });

    it('parses bar width from the series node', () => {
        const tnode = createMockBarNode('[{x: 1, y: 100}]', undefined, '16');
        const {seriesConfig} = buildBarTooltipEntries({tnode, yKey: 'y4', isHorizontal: false});

        expect(seriesConfig.barWidth).toBe(16);
    });
});
