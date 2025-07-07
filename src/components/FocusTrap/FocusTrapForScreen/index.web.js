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
var native_1 = require("@react-navigation/native");
var focus_trap_react_1 = require("focus-trap-react");
var react_1 = require("react");
var sharedTrapStack_1 = require("@components/FocusTrap/sharedTrapStack");
var TOP_TAB_SCREENS_1 = require("@components/FocusTrap/TOP_TAB_SCREENS");
var WIDE_LAYOUT_INACTIVE_SCREENS_1 = require("@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var CONST_1 = require("@src/CONST");
function FocusTrapForScreen(_a) {
    var _b, _c;
    var children = _a.children, focusTrapSettings = _a.focusTrapSettings;
    var isFocused = (0, native_1.useIsFocused)();
    var route = (0, native_1.useRoute)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var isActive = (0, react_1.useMemo)(function () {
        if (typeof (focusTrapSettings === null || focusTrapSettings === void 0 ? void 0 : focusTrapSettings.active) !== 'undefined') {
            return focusTrapSettings.active;
        }
        // Focus trap can't be active on sidebar screens because it would block access to the tab bar.
        if ((0, isNavigatorName_1.isSidebarScreenName)(route.name)) {
            return false;
        }
        // in top tabs only focus trap for currently shown tab should be active
        if (TOP_TAB_SCREENS_1.default.find(function (screen) { return screen === route.name; })) {
            return isFocused;
        }
        // Focus trap can't be active on these screens if the layout is wide because they may be displayed side by side.
        if (WIDE_LAYOUT_INACTIVE_SCREENS_1.default.includes(route.name) && !shouldUseNarrowLayout) {
            return false;
        }
        return true;
    }, [isFocused, shouldUseNarrowLayout, route.name, focusTrapSettings === null || focusTrapSettings === void 0 ? void 0 : focusTrapSettings.active]);
    return (<focus_trap_react_1.FocusTrap active={isActive} paused={!isFocused} containerElements={((_b = focusTrapSettings === null || focusTrapSettings === void 0 ? void 0 : focusTrapSettings.containerElements) === null || _b === void 0 ? void 0 : _b.length) ? focusTrapSettings.containerElements : undefined} focusTrapOptions={__assign({ onActivate: function () {
                var activeElement = document === null || document === void 0 ? void 0 : document.activeElement;
                if ((activeElement === null || activeElement === void 0 ? void 0 : activeElement.nodeName) === CONST_1.default.ELEMENT_NAME.INPUT || (activeElement === null || activeElement === void 0 ? void 0 : activeElement.nodeName) === CONST_1.default.ELEMENT_NAME.TEXTAREA) {
                    return;
                }
                activeElement === null || activeElement === void 0 ? void 0 : activeElement.blur();
            }, trapStack: sharedTrapStack_1.default, allowOutsideClick: true, fallbackFocus: document.body, delayInitialFocus: CONST_1.default.ANIMATED_TRANSITION, initialFocus: false, setReturnFocus: false }, ((_c = focusTrapSettings === null || focusTrapSettings === void 0 ? void 0 : focusTrapSettings.focusTrapOptions) !== null && _c !== void 0 ? _c : {}))}>
            {children}
        </focus_trap_react_1.FocusTrap>);
}
FocusTrapForScreen.displayName = 'FocusTrapForScreen';
exports.default = FocusTrapForScreen;
