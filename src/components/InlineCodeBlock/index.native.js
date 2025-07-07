"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
/**
 * Retrieves the text content from a Text or Phrasing node.
 *
 * @param defaultRendererProps - The default renderer props containing the node information.
 * @returns The text content of the node.
 *
 * @template TTextOrTPhrasing
 */
function getCurrentData(defaultRendererProps) {
    if ('data' in defaultRendererProps.tnode) {
        return defaultRendererProps.tnode.data;
    }
    return defaultRendererProps.tnode.children.map(function (child) { return ('data' in child ? child.data : ''); }).join('');
}
function InlineCodeBlock(_a) {
    var TDefaultRenderer = _a.TDefaultRenderer, defaultRendererProps = _a.defaultRendererProps, textStyle = _a.textStyle, boxModelStyle = _a.boxModelStyle;
    var data = getCurrentData(defaultRendererProps);
    return (<TDefaultRenderer 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...defaultRendererProps}>
            <Text_1.default style={[boxModelStyle, textStyle]}>{data}</Text_1.default>
        </TDefaultRenderer>);
}
InlineCodeBlock.displayName = 'InlineCodeBlock';
exports.default = InlineCodeBlock;
