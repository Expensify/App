"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_render_html_1 = require("react-native-render-html");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function TaskTitleRenderer(_a) {
    var tnode = _a.tnode;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_render_html_1.TNodeChildrenRenderer tnode={tnode} renderChild={function (props) {
            return (<Text_1.default style={[styles.taskTitleMenuItem]} key={props.key}>
                        {props.childElement}
                    </Text_1.default>);
        }}/>);
}
TaskTitleRenderer.displayName = 'TaskTitleRenderer';
exports.default = TaskTitleRenderer;
