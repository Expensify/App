"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Parser_1 = require("@libs/Parser");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var RenderHTML_1 = require("./RenderHTML");
var Text_1 = require("./Text");
function FormHelpMessage(_a) {
    var _b = _a.message, message = _b === void 0 ? '' : _b, children = _a.children, _c = _a.isError, isError = _c === void 0 ? true : _c, style = _a.style, _d = _a.shouldShowRedDotIndicator, shouldShowRedDotIndicator = _d === void 0 ? true : _d, _e = _a.shouldRenderMessageAsHTML, shouldRenderMessageAsHTML = _e === void 0 ? false : _e;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var HTMLMessage = (0, react_1.useMemo)(function () {
        if (typeof message !== 'string' || !shouldRenderMessageAsHTML) {
            return '';
        }
        var replacedText = Parser_1.default.replace(message, { shouldEscapeText: false });
        if (isError) {
            return "<alert-text>".concat(replacedText, "</alert-text>");
        }
        return "<muted-text-label>".concat(replacedText, "</muted-text-label>");
    }, [isError, message, shouldRenderMessageAsHTML]);
    if ((0, isEmpty_1.default)(message) && (0, isEmpty_1.default)(children)) {
        return null;
    }
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, style]}>
            {isError && shouldShowRedDotIndicator && (<Icon_1.default src={Expensicons.DotIndicator} fill={theme.danger}/>)}
            <react_native_1.View style={[styles.flex1, isError && shouldShowRedDotIndicator ? styles.ml2 : {}]}>
                {children !== null && children !== void 0 ? children : (shouldRenderMessageAsHTML ? <RenderHTML_1.default html={HTMLMessage}/> : <Text_1.default style={[isError ? styles.formError : styles.formHelp, styles.mb0]}>{message}</Text_1.default>)}
            </react_native_1.View>
        </react_native_1.View>);
}
FormHelpMessage.displayName = 'FormHelpMessage';
exports.default = FormHelpMessage;
