"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function RepliesDivider(_a) {
    var _b;
    var shouldHideThreadDividerLine = _a.shouldHideThreadDividerLine;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.mt3, styles.mb1, styles.userSelectNone]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
            <Icon_1.default src={Expensicons.Thread} fill={theme.icon} width={variables_1.default.iconSizeExtraSmall} height={variables_1.default.iconSizeExtraSmall}/>
            <Text_1.default style={[styles.threadDividerText, styles.textSupporting, styles.ml1, styles.userSelectNone]}>{translate('threads.replies')}</Text_1.default>
            {!shouldHideThreadDividerLine && <react_native_1.View style={[styles.threadDividerLine]}/>}
        </react_native_1.View>);
}
RepliesDivider.displayName = 'RepliesDivider';
exports.default = RepliesDivider;
