"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.focusedItemRef = void 0;
var react_1 = require("react");
var ScreenWrapperStatusContext_1 = require("@components/ScreenWrapper/ScreenWrapperStatusContext");
// This mutable ref holds the currently focused item's ref.
// It enables external actions like calling .focus() from outside this hook,
// as demonstrated in this PR: https://github.com/Expensify/App/pull/59206
// eslint-disable-next-line import/no-mutable-exports
var focusedItemRef;
/**
 * Custom React hook created to handle sync of focus on an element when the user navigates through the app with keyboard.
 * When the user navigates through the app using the arrows and then the tab button, the focus on the element and the native focus of the browser differs.
 * To maintain consistency when an element is focused in the app, the focus() method is additionally called on the focused element to eliminate the difference between native browser focus and application focus.
 */
var useSyncFocusImplementation = function (ref, isFocused, shouldSyncFocus) {
    if (shouldSyncFocus === void 0) { shouldSyncFocus = true; }
    // this hook can be used outside ScreenWrapperStatusContext (eg. in Popovers). So we to check if the context is present.
    // If we are outside context we don't have to look at transition status
    var contextValue = (0, react_1.useContext)(ScreenWrapperStatusContext_1.default);
    var didScreenTransitionEnd = contextValue ? contextValue.didScreenTransitionEnd : true;
    (0, react_1.useLayoutEffect)(function () {
        var _a;
        if (isFocused) {
            exports.focusedItemRef = focusedItemRef = ref.current;
        }
        if (!isFocused || !shouldSyncFocus || !didScreenTransitionEnd) {
            return;
        }
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.focus({ preventScroll: true });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [didScreenTransitionEnd, isFocused, ref]);
};
exports.default = useSyncFocusImplementation;
