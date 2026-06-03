import type {TNode} from 'react-native-render-html';
import type {PartialProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parses layout metadata from a `<victorygroup>` node for grouped bar hit-testing.
 */
function parseVictoryBarGroupNode(tnode: TNode): PartialProcessNodeResult {
    const barChildren = tnode.children.filter((child) => child.tagName === 'victorybar');
    const firstBarChild = barChildren.at(0);

    if (!firstBarChild) {
        return {};
    }

    const barWidth = firstBarChild.attributes.barwidth !== undefined ? Number(parseAttribute(firstBarChild.attributes.barwidth)) : undefined;
    const offset = tnode.attributes.offset !== undefined ? Number(parseAttribute(tnode.attributes.offset)) : 0;

    return {
        barGroupLayouts: [
            {
                yKeys: barChildren.map((child) => getYKey(child)),
                barWidth,
                offset,
            },
        ],
    };
}

export default parseVictoryBarGroupNode;
