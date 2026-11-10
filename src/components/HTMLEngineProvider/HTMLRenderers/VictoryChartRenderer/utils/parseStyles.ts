import type {ViewStyle} from 'react-native';
import type {TNode} from 'react-native-render-html';

import lodashIsObject from 'lodash/isObject';

import parseAttribute from './parseAttribute';

/** Chart nodes also carry the SVG paint properties that the chart's style attribute sets */
type ChartNodeStyle = ViewStyle & {
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
};

/**
 * Extract width, height, and style overrides from a tnode's HTML attributes.
 * Returns separate style objects for the node itself and its parent container.
 */
function parseStyles(tnode: TNode): {nodeStyles: ChartNodeStyle; parentNodeStyles: ViewStyle} {
    const nodeStyles: ChartNodeStyle = {};
    const parentNodeStyles: ViewStyle = {};

    const parsedHeight = parseAttribute(tnode.attributes.height);
    if (typeof parsedHeight === 'number') {
        nodeStyles.height = parsedHeight;
    }
    const parsedWidth = parseAttribute(tnode.attributes.width);
    if (typeof parsedWidth === 'number') {
        nodeStyles.width = parsedWidth;
    }

    const parsedStyle = parseAttribute(tnode.attributes.style);
    if (lodashIsObject(parsedStyle)) {
        if ('parent' in parsedStyle && lodashIsObject(parsedStyle.parent)) {
            Object.assign(parentNodeStyles, parsedStyle.parent);
        }
        if ('data' in parsedStyle && lodashIsObject(parsedStyle.data)) {
            Object.assign(nodeStyles, parsedStyle.data);
        }
    }

    return {nodeStyles, parentNodeStyles};
}

export default parseStyles;
