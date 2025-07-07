"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var RenderHTML_1 = require("@components/RenderHTML");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TaskUtils = require("@libs/TaskUtils");
function TaskAction(_a) {
    var action = _a.action;
    var styles = (0, useThemeStyles_1.default)();
    var message = TaskUtils.getTaskReportActionMessage(action);
    return (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.breakWord, styles.preWrap]}>
            {message.html ? (<RenderHTML_1.default html={"<comment><muted-text>".concat(message.html, "</muted-text></comment>")}/>) : (<Text_1.default style={[styles.chatItemMessage, styles.colorMuted]}>{message.text}</Text_1.default>)}
        </react_native_1.View>);
}
TaskAction.displayName = 'TaskAction';
exports.default = TaskAction;
