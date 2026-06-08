import type {TNode} from 'react-native-render-html';
import type {RawShiftedLineSegmentStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute, {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse label indicator config from a `<ShiftedLineSegment>` node.
 */
function parseShiftedLineSegmentNode(tnode: TNode) {
    const xShift = parseAttributeAsNumber(tnode.attributes.dx) ?? 0;
    const yShift = parseAttributeAsNumber(tnode.attributes.dy) ?? 0;
    const style = parseAttribute<RawShiftedLineSegmentStyle>(tnode.attributes.style);
    const stroke = style?.stroke;
    const strokeWidth = style?.strokeWidth;
    return {xShift, yShift, stroke, strokeWidth};
}

export default parseShiftedLineSegmentNode;
