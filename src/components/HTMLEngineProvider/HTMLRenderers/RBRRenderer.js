"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_render_html_1 = require("react-native-render-html");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function RBRRenderer(_a) {
    var tnode = _a.tnode, style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var htmlAttribs = tnode.attributes;
    var shouldShowEllipsis = (htmlAttribs === null || htmlAttribs === void 0 ? void 0 : htmlAttribs.shouldshowellipsis) !== undefined;
    var flattenStyle = react_native_1.StyleSheet.flatten(style);
    return (<react_native_render_html_1.TNodeChildrenRenderer tnode={tnode} renderChild={function (props) {
            return (<Text_1.default numberOfLines={shouldShowEllipsis ? 1 : 0} ellipsizeMode="tail" key={props.key} style={[styles.textLabelError, flattenStyle]}>
                        {props.childElement}
                    </Text_1.default>);
        }}/>);
}
RBRRenderer.displayName = 'RBRRenderer';
exports.default = RBRRenderer;
