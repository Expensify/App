"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var EmojiWithTooltip_1 = require("@components/EmojiWithTooltip");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
/**
 * This function is used to render elements based on the provided defaultRendererProps and styles.
 * It iterates over the children of the tnode object in defaultRendererProps, and for each child,
 * it checks if the child's tagName is 'emoji'. If it is, it creates an EmojiWithTooltip component
 * with the appropriate styles and adds it to the elements array. If it's not, it adds the child's
 * 'data' property to the elements array. The function then returns the elements array.
 *
 * @param defaultRendererProps - The default renderer props.
 * @param textStyles - The text styles.
 * @param styles - The theme styles.
 * @returns The array of elements to be rendered.
 */
function renderElements(defaultRendererProps, textStyles, styles) {
    var elements = [];
    if ('data' in defaultRendererProps.tnode) {
        elements.push(defaultRendererProps.tnode.data);
        return elements;
    }
    if (!defaultRendererProps.tnode.children) {
        return elements;
    }
    defaultRendererProps.tnode.children.forEach(function (child) {
        if (!('data' in child)) {
            return;
        }
        if (child.tagName === 'emoji') {
            elements.push(<EmojiWithTooltip_1.default style={[textStyles, styles.cursorDefault, styles.emojiDefaultStyles]} key={child.data} emojiCode={child.data}/>);
        }
        else {
            elements.push(child.data);
        }
    });
    return elements;
}
function InlineCodeBlock(_a) {
    var TDefaultRenderer = _a.TDefaultRenderer, textStyle = _a.textStyle, defaultRendererProps = _a.defaultRendererProps, boxModelStyle = _a.boxModelStyle;
    var styles = (0, useThemeStyles_1.default)();
    var flattenTextStyle = react_native_1.StyleSheet.flatten(textStyle);
    var textDecorationLine = flattenTextStyle.textDecorationLine, textStyles = __rest(flattenTextStyle, ["textDecorationLine"]);
    var elements = renderElements(defaultRendererProps, textStyles, styles);
    return (<TDefaultRenderer 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...defaultRendererProps}>
            <Text_1.default style={[boxModelStyle, textStyles]}>{elements}</Text_1.default>
        </TDefaultRenderer>);
}
InlineCodeBlock.displayName = 'InlineCodeBlock';
exports.default = InlineCodeBlock;
