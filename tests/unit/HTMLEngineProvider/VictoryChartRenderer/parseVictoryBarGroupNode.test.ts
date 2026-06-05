import type {TNode} from 'react-native-render-html';
import parseVictoryBarGroupNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryBarGroupParser';

function createMockBarNode(id: string, data: string): TNode {
    return {
        tagName: 'victorybar',
        attributes: {
            data,
            barwidth: '16',
        },
        domNode: {parent: {children: [{}, {}]}} as never,
        init: {domNode: {parent: {children: [{}, {}]}}} as never,
    } as unknown as TNode;
}

describe('parseVictoryBarGroupNode', () => {
    it('captures grouped bar layout metadata for hit-testing', () => {
        const tnode = {
            tagName: 'victorygroup',
            attributes: {offset: '18'},
            children: [createMockBarNode('a', "[{x: 'Carlos Martins', y: 220}]"), createMockBarNode('b', "[{x: 'Carlos Martins', y: 140}]")],
        } as unknown as TNode;

        const {barGroupLayouts} = parseVictoryBarGroupNode(tnode);

        expect(barGroupLayouts).toHaveLength(1);
        expect(barGroupLayouts?.at(0)).toMatchObject({
            barWidth: 16,
            offset: 18,
        });
        expect(barGroupLayouts?.at(0)?.yKeys).toHaveLength(2);
    });
});
