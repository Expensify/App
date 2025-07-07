"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Browser_1 = require("@libs/Browser");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var CONST_1 = require("@src/CONST");
var BaseSelectionList_1 = require("./BaseSelectionList");
function SelectionList(_a, ref) {
    var onScroll = _a.onScroll, props = __rest(_a, ["onScroll"]);
    var _b = (0, react_1.useState)(false), isScreenTouched = _b[0], setIsScreenTouched = _b[1];
    var touchStart = function () { return setIsScreenTouched(true); };
    var touchEnd = function () { return setIsScreenTouched(false); };
    (0, react_1.useEffect)(function () {
        if (!(0, DeviceCapabilities_1.canUseTouchScreen)()) {
            return;
        }
        // We're setting `isScreenTouched` in this listener only for web platforms with touchscreen (mWeb) where
        // we want to dismiss the keyboard only when the list is scrolled by the user and not when it's scrolled programmatically.
        document.addEventListener('touchstart', touchStart);
        document.addEventListener('touchend', touchEnd);
        return function () {
            document.removeEventListener('touchstart', touchStart);
            document.removeEventListener('touchend', touchEnd);
        };
    }, []);
    var _c = (0, react_1.useState)(false), shouldDebounceScrolling = _c[0], setShouldDebounceScrolling = _c[1];
    var checkShouldDebounceScrolling = function (event) {
        if (!event) {
            return;
        }
        // Moving through items using the keyboard triggers scrolling by the browser, so we debounce programmatic scrolling to prevent jittering.
        if (event.key === CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey ||
            event.key === CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey ||
            event.key === CONST_1.default.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            setShouldDebounceScrolling(event.type === 'keydown');
        }
    };
    (0, react_1.useEffect)(function () {
        document.addEventListener('keydown', checkShouldDebounceScrolling, { passive: true });
        document.addEventListener('keyup', checkShouldDebounceScrolling, { passive: true });
        return function () {
            document.removeEventListener('keydown', checkShouldDebounceScrolling);
            document.removeEventListener('keyup', checkShouldDebounceScrolling);
        };
    }, []);
    // In SearchPageBottomTab we use useAnimatedScrollHandler from reanimated(for performance reasons) and it returns object instead of function. In that case we cannot change it to a function call, that's why we have to choose between onScroll and defaultOnScroll.
    var defaultOnScroll = function () {
        // Only dismiss the keyboard whenever the user scrolls the screen
        if (!isScreenTouched) {
            return;
        }
        react_native_1.Keyboard.dismiss();
    };
    return (<BaseSelectionList_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} onScroll={onScroll !== null && onScroll !== void 0 ? onScroll : defaultOnScroll} 
    // Ignore the focus if it's caused by a touch event on mobile chrome.
    // For example, a long press will trigger a focus event on mobile chrome.
    shouldIgnoreFocus={(0, Browser_1.isMobileChrome)() && isScreenTouched} shouldDebounceScrolling={shouldDebounceScrolling}/>);
}
SelectionList.displayName = 'SelectionList';
exports.default = (0, react_1.forwardRef)(SelectionList);
