import type {TNode} from 'react-native-render-html';
import parseVictoryPieNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryPieParser';

function createMockPieNode(data: string, labels?: string): TNode {
    return {
        tagName: 'victorypie',
        attributes: {
            data,
            ...(labels ? {labels} : {}),
        },
    } as unknown as TNode;
}

describe('parseVictoryPieNode', () => {
    it('parses explicit pie labels into tooltip entries', () => {
        const tnode = createMockPieNode("[{x: 'Interest', y: 220}]", "['Interest\\n$220']");
        const {pieTooltipEntries} = parseVictoryPieNode(tnode);

        expect(pieTooltipEntries).toHaveLength(1);
        expect(pieTooltipEntries?.at(0)).toMatchObject({
            label: 'Interest\n$220',
            total: 220,
            isLabelOnly: true,
        });
    });

    it('falls back to the category name when labels are missing', () => {
        const tnode = createMockPieNode("[{x: 'Travel', y: 500}]");
        const {pieTooltipEntries} = parseVictoryPieNode(tnode);

        expect(pieTooltipEntries?.at(0)).toMatchObject({
            label: 'Travel',
            total: 500,
            isLabelOnly: false,
        });
    });
});
