"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ScreenWrapperOfflineIndicatorContext_1 = require("@components/ScreenWrapper/ScreenWrapperOfflineIndicatorContext");
var CONST_1 = require("@src/CONST");
var useNetwork_1 = require("./useNetwork");
var useSafeAreaPaddings_1 = require("./useSafeAreaPaddings");
/**
 * useBottomSafeSafeAreaPaddingStyle is a hook that creates or adapts a given style and adds bottom safe area padding.
 * It is useful for creating new styles or updating existing style props (e.g. contentContainerStyle).
 * @param params - The parameters for the hook.
 * @returns The style with bottom safe area padding applied.
 */
function useBottomSafeSafeAreaPaddingStyle(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.addBottomSafeAreaPadding, addBottomSafeAreaPadding = _c === void 0 ? false : _c, _d = _b.addOfflineIndicatorBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _d === void 0 ? addBottomSafeAreaPadding : _d, style = _b.style, _e = _b.styleProperty, styleProperty = _e === void 0 ? 'paddingBottom' : _e, _f = _b.additionalPaddingBottom, additionalPaddingBottom = _f === void 0 ? 0 : _f;
    var safeAreaPaddingBottom = (0, useSafeAreaPaddings_1.default)(true).paddingBottom;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isOfflineIndicatorSafeAreaPaddingEnabled = (0, react_1.useContext)(ScreenWrapperOfflineIndicatorContext_1.default).addSafeAreaPadding;
    return (0, react_1.useMemo)(function () {
        var _a;
        var totalPaddingBottom = additionalPaddingBottom;
        // Add the safe area padding to the total padding if the flag is enabled
        if (addBottomSafeAreaPadding) {
            totalPaddingBottom += safeAreaPaddingBottom;
        }
        if (addOfflineIndicatorBottomSafeAreaPadding && isOffline && isOfflineIndicatorSafeAreaPaddingEnabled) {
            totalPaddingBottom += CONST_1.default.OFFLINE_INDICATOR_HEIGHT;
        }
        // If there is no bottom safe area or additional padding, return the style as is
        if (totalPaddingBottom === 0) {
            return style;
        }
        // If a style is provided, flatten the style and add the padding to it
        if (style) {
            var contentContainerStyleFlattened = react_native_1.StyleSheet.flatten(style);
            var styleBottomSafeAreaPadding = contentContainerStyleFlattened === null || contentContainerStyleFlattened === void 0 ? void 0 : contentContainerStyleFlattened[styleProperty];
            if (typeof styleBottomSafeAreaPadding === 'number') {
                totalPaddingBottom += styleBottomSafeAreaPadding;
            }
            else if (typeof styleBottomSafeAreaPadding === 'string') {
                totalPaddingBottom = "calc(".concat(totalPaddingBottom, "px + ").concat(styleBottomSafeAreaPadding, ")");
            }
            else if (styleBottomSafeAreaPadding !== undefined) {
                return style;
            }
            // The user of this hook can decide which style property to use for applying the padding.
            return [style, (_a = {}, _a[styleProperty] = totalPaddingBottom, _a)];
        }
        // If no style is provided, return the padding as an object
        return { paddingBottom: totalPaddingBottom };
    }, [
        additionalPaddingBottom,
        addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding,
        isOffline,
        isOfflineIndicatorSafeAreaPaddingEnabled,
        style,
        safeAreaPaddingBottom,
        styleProperty,
    ]);
}
exports.default = useBottomSafeSafeAreaPaddingStyle;
