import type {TNode} from 'react-native-render-html';
import getVictoryPieLayout from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getVictoryPieLayout';

function createPieNode(radius?: string, innerRadius?: string): TNode {
    return {
        tagName: 'victorypie',
        attributes: {
            ...(radius ? {radius} : {}),
            ...(innerRadius ? {innerradius: innerRadius} : {}),
        },
    } as TNode;
}

describe('getVictoryPieLayout', () => {
    it('matches Pie.Chart size when radius is explicit in HTML', () => {
        const layout = getVictoryPieLayout(createPieNode('145', '125'), 680, 530);

        expect(layout).toMatchObject({
            radius: 145,
            innerRadius: 125,
            size: 290,
            hitTestRadius: 145,
            centerX: 340,
            centerY: 265,
        });
    });

    it('leaves size undefined when radius is omitted', () => {
        const layout = getVictoryPieLayout(createPieNode(), 680, 530);

        expect(layout.size).toBeUndefined();
        expect(layout.radius).toBeUndefined();
        expect(layout.hitTestRadius).toBe(Math.min(680, 530) / 2);
    });
});
