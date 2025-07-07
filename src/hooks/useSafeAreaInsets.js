"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line no-restricted-imports
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var useStyleUtils_1 = require("./useStyleUtils");
/**
 * Note: if you're looking for a hook to implement safe area padding in your screen, please either:
 * - add the `addBottomSafeAreaPadding` prop to generic components like ScrollView, SelectionList or FormProvider.
 * - use the `useSafeAreaPaddings` hook.
 *
 * This hook is only meant for internal use cases where you need to access the raw safe area insets.
 */
function useSafeAreaInsets() {
    var StyleUtils = (0, useStyleUtils_1.default)();
    var insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    var adjustedInsets = StyleUtils.getSafeAreaInsets(insets);
    return adjustedInsets;
}
exports.default = useSafeAreaInsets;
