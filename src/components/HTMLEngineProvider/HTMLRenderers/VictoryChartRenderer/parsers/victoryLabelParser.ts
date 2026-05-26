import type {TNode} from 'react-native-render-html';
import type {LabelItem, PartialProcessNodeResult, RawLabelStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse label config from a `<victorylabel>` node.
 */
function parseVictoryLabelNode(tnode: TNode): PartialProcessNodeResult {
    const x = parseAttribute<number>(tnode.attributes.x) ?? 0;
    const y = parseAttribute<number>(tnode.attributes.y) ?? 0;
    const text = parseAttribute<string>(tnode.attributes.text) ?? '';
    const style = parseAttribute<RawLabelStyle>(tnode.attributes.style);
    const color = style?.fill;
    const fontSize = style?.fontSize !== undefined ? Number(style.fontSize) : undefined;
    const fontWeight = Number(style?.fontWeight) === 700 ? 'bold' : undefined;
    const labelItem: LabelItem = {x, y, text, color, fontSize, fontWeight};
    return {labelItems: [labelItem]};
}

export default parseVictoryLabelNode;
