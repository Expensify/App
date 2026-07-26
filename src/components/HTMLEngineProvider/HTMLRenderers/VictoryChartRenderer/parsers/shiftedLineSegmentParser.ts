import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseRawShiftedLineSegmentStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawShiftedLineSegmentStyle';

import type {TNode} from 'react-native-render-html';

/**
 * Parse label indicator config from a `<ShiftedLineSegment>` node.
 */
function parseShiftedLineSegmentNode(tnode: TNode) {
    const xShift = parseAttributeAsNumber(tnode.attributes.dx) ?? 0;
    const yShift = parseAttributeAsNumber(tnode.attributes.dy) ?? 0;
    const style = parseRawShiftedLineSegmentStyle(tnode.attributes.style);
    const stroke = style?.stroke;
    const strokeWidth = style?.strokeWidth;
    return {xShift, yShift, stroke, strokeWidth};
}

export default parseShiftedLineSegmentNode;
