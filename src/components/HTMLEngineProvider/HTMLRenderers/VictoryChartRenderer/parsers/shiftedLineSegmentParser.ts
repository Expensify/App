import type {TNode} from 'react-native-render-html';
import type {RawShiftedLineSegmentStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse label indicator config from a `<ShiftedLineSegment>` node.
 */
function parseShiftedLineSegmentNode(tnode: TNode) {
    const xShift = parseAttribute<number>(tnode.attributes.dx) ?? 0;
    const yShift = parseAttribute<number>(tnode.attributes.dy) ?? 0;
    const style = parseAttribute<RawShiftedLineSegmentStyle>(tnode.attributes.style);
    const stroke = style?.stroke;
    const strokeWidth = style?.strokeWidth;
    return {xShift, yShift, stroke, strokeWidth};
}

export default parseShiftedLineSegmentNode;
