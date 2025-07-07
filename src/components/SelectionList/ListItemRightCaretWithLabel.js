"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ListItemRightCaretWithLabel(_a) {
    var labelText = _a.labelText, _b = _a.shouldShowCaret, shouldShowCaret = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<react_native_1.View style={styles.flexRow}>
            <react_native_1.View style={[StyleUtils.getMinimumWidth(60)]}>{!!labelText && <Text_1.default style={[styles.textAlignCenter, styles.textSupporting, styles.label]}>{labelText}</Text_1.default>}</react_native_1.View>
            {shouldShowCaret && (<react_native_1.View style={[styles.pl2]}>
                    <Icon_1.default src={Expensicons.ArrowRight} fill={theme.icon}/>
                </react_native_1.View>)}
        </react_native_1.View>);
}
ListItemRightCaretWithLabel.displayName = 'ListItemRightCaretWithLabel';
exports.default = ListItemRightCaretWithLabel;
