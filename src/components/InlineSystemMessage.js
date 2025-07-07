"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var Text_1 = require("./Text");
function InlineSystemMessage(_a) {
    var _b = _a.message, message = _b === void 0 ? '' : _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    if (!message) {
        return null;
    }
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Icon_1.default src={Expensicons.Exclamation} fill={theme.danger}/>
            <Text_1.default style={styles.inlineSystemMessage}>{message}</Text_1.default>
        </react_native_1.View>);
}
InlineSystemMessage.displayName = 'InlineSystemMessage';
exports.default = InlineSystemMessage;
