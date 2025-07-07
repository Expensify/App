"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
/**
 * This component is a light wrapper around the SafeAreaInsetsContext.Consumer. There are several places where we
 * may need not just the insets, but the computed styles so we save a few lines of code with this.
 */
function SafeAreaConsumer(_a) {
    var children = _a.children;
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<react_native_safe_area_context_1.SafeAreaInsetsContext.Consumer>
            {function (safeAreaInsets) {
            var insets = StyleUtils.getSafeAreaInsets(safeAreaInsets);
            var _a = StyleUtils.getPlatformSafeAreaPadding(insets), paddingTop = _a.paddingTop, paddingBottom = _a.paddingBottom;
            return children({
                paddingTop: paddingTop,
                paddingBottom: paddingBottom,
                insets: insets,
                safeAreaPaddingBottomStyle: { paddingBottom: paddingBottom },
            });
        }}
        </react_native_safe_area_context_1.SafeAreaInsetsContext.Consumer>);
}
SafeAreaConsumer.displayName = 'SafeAreaConsumer';
exports.default = SafeAreaConsumer;
