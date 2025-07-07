"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function TextWithEllipsis(_a) {
    var leadingText = _a.leadingText, trailingText = _a.trailingText, textStyle = _a.textStyle, leadingTextParentStyle = _a.leadingTextParentStyle, wrapperStyle = _a.wrapperStyle;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.flexRow, wrapperStyle]}>
            <react_native_1.View style={[styles.flexShrink1, leadingTextParentStyle]}>
                <Text_1.default style={textStyle} numberOfLines={1}>
                    {leadingText}
                </Text_1.default>
            </react_native_1.View>
            <react_native_1.View style={styles.flexShrink0}>
                <Text_1.default style={textStyle}>{trailingText}</Text_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
TextWithEllipsis.displayName = 'TextWithEllipsis';
exports.default = TextWithEllipsis;
