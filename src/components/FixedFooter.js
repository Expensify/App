"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function FixedFooter(_a) {
    var style = _a.style, children = _a.children, addBottomSafeAreaPadding = _a.addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _a.addOfflineIndicatorBottomSafeAreaPadding, _b = _a.shouldStickToBottom, shouldStickToBottom = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var bottomSafeAreaPaddingStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({
        addBottomSafeAreaPadding: addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: addOfflineIndicatorBottomSafeAreaPadding,
        additionalPaddingBottom: styles.pb5.paddingBottom,
        styleProperty: shouldStickToBottom ? 'bottom' : 'paddingBottom',
    });
    var footerStyle = (0, react_1.useMemo)(function () { return [shouldStickToBottom && styles.stickToBottom, bottomSafeAreaPaddingStyle]; }, [bottomSafeAreaPaddingStyle, shouldStickToBottom, styles.stickToBottom]);
    if (!children) {
        return null;
    }
    return <react_native_1.View style={[styles.ph5, styles.flexShrink0, footerStyle, style]}>{children}</react_native_1.View>;
}
FixedFooter.displayName = 'FixedFooter';
exports.default = FixedFooter;
