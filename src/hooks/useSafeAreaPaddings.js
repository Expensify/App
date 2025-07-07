"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ScreenWrapperStatusContext_1 = require("@components/ScreenWrapper/ScreenWrapperStatusContext");
var useSafeAreaInsets_1 = require("./useSafeAreaInsets");
var useStyleUtils_1 = require("./useStyleUtils");
/**
 * Custom hook to get safe area padding values and styles.
 *
 * This hook utilizes the `SafeAreaInsetsContext` to retrieve the current safe area insets
 * and applies styling adjustments using the `useStyleUtils` hook.
 *
 * @returns  An object containing the styled safe area insets and additional styles.
 * @returns  .paddingTop The top padding adjusted for safe area.
 * @returns  .paddingBottom The bottom padding adjusted for safe area.
 * @returns  .insets The safe area insets object or undefined if not available.
 * @returns  .safeAreaPaddingBottomStyle An object containing the bottom padding style adjusted for safe area.
 *
 * @example
 * function MyScreen() {
 *   return (
 *      <ScreenWrapper>
 *          <MyComponent />
 *      </ScreenWrapper>
 *   );
 * }
 *
 * function MyComponent() {
 *     const { paddingTop, paddingBottom, safeAreaPaddingBottomStyle } = useSafeAreaPaddings();
 *
 *     // Use these values to style your component accordingly
 * }
 */
function useSafeAreaPaddings(isUsingEdgeToEdgeBottomSafeAreaPadding) {
    var _a, _b;
    if (isUsingEdgeToEdgeBottomSafeAreaPadding === void 0) { isUsingEdgeToEdgeBottomSafeAreaPadding = false; }
    var StyleUtils = (0, useStyleUtils_1.default)();
    var insets = (0, useSafeAreaInsets_1.default)();
    var _c = (0, react_1.useMemo)(function () { return StyleUtils.getPlatformSafeAreaPadding(insets); }, [StyleUtils, insets]), paddingTop = _c.paddingTop, paddingBottom = _c.paddingBottom;
    var screenWrapperStatusContext = (0, react_1.useContext)(ScreenWrapperStatusContext_1.default);
    var isSafeAreaTopPaddingApplied = (_a = screenWrapperStatusContext === null || screenWrapperStatusContext === void 0 ? void 0 : screenWrapperStatusContext.isSafeAreaTopPaddingApplied) !== null && _a !== void 0 ? _a : false;
    var isSafeAreaBottomPaddingApplied = (_b = screenWrapperStatusContext === null || screenWrapperStatusContext === void 0 ? void 0 : screenWrapperStatusContext.isSafeAreaBottomPaddingApplied) !== null && _b !== void 0 ? _b : false;
    var adaptedPaddingBottom = isSafeAreaBottomPaddingApplied ? 0 : paddingBottom;
    var safeAreaPaddingBottomStyle = (0, react_1.useMemo)(function () { return ({ paddingBottom: isUsingEdgeToEdgeBottomSafeAreaPadding ? paddingBottom : adaptedPaddingBottom }); }, [adaptedPaddingBottom, isUsingEdgeToEdgeBottomSafeAreaPadding, paddingBottom]);
    if (isUsingEdgeToEdgeBottomSafeAreaPadding) {
        return {
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
            unmodifiedPaddings: {},
            insets: insets,
            safeAreaPaddingBottomStyle: safeAreaPaddingBottomStyle,
        };
    }
    var adaptedInsets = __assign(__assign({}, insets), { top: isSafeAreaTopPaddingApplied ? 0 : insets === null || insets === void 0 ? void 0 : insets.top, bottom: isSafeAreaBottomPaddingApplied ? 0 : insets === null || insets === void 0 ? void 0 : insets.bottom });
    return {
        paddingTop: isSafeAreaTopPaddingApplied ? 0 : paddingTop,
        paddingBottom: adaptedPaddingBottom,
        unmodifiedPaddings: {
            top: paddingTop,
            bottom: paddingBottom,
        },
        insets: adaptedInsets,
        safeAreaPaddingBottomStyle: safeAreaPaddingBottomStyle,
    };
}
exports.default = useSafeAreaPaddings;
