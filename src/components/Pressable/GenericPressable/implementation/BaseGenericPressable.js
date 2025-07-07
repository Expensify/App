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
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Accessibility_1 = require("@libs/Accessibility");
var HapticFeedback_1 = require("@libs/HapticFeedback");
var KeyboardShortcut_1 = require("@libs/KeyboardShortcut");
var CONST_1 = require("@src/CONST");
function GenericPressable(_a, ref) {
    var children = _a.children, _b = _a.onPress, onPress = _b === void 0 ? function () { } : _b, onLongPress = _a.onLongPress, onKeyDown = _a.onKeyDown, disabled = _a.disabled, style = _a.style, _c = _a.disabledStyle, disabledStyle = _c === void 0 ? {} : _c, _d = _a.hoverStyle, hoverStyle = _d === void 0 ? {} : _d, _e = _a.focusStyle, focusStyle = _e === void 0 ? {} : _e, _f = _a.pressStyle, pressStyle = _f === void 0 ? {} : _f, _g = _a.screenReaderActiveStyle, screenReaderActiveStyle = _g === void 0 ? {} : _g, _h = _a.shouldUseHapticsOnLongPress, shouldUseHapticsOnLongPress = _h === void 0 ? true : _h, _j = _a.shouldUseHapticsOnPress, shouldUseHapticsOnPress = _j === void 0 ? false : _j, nextFocusRef = _a.nextFocusRef, keyboardShortcut = _a.keyboardShortcut, _k = _a.shouldUseAutoHitSlop, shouldUseAutoHitSlop = _k === void 0 ? false : _k, _l = _a.enableInScreenReaderStates, enableInScreenReaderStates = _l === void 0 ? CONST_1.default.SCREEN_READER_STATES.ALL : _l, onPressIn = _a.onPressIn, onPressOut = _a.onPressOut, _m = _a.accessible, accessible = _m === void 0 ? true : _m, _o = _a.fullDisabled, fullDisabled = _o === void 0 ? false : _o, _p = _a.interactive, interactive = _p === void 0 ? true : _p, _q = _a.isNested, isNested = _q === void 0 ? false : _q, rest = __rest(_a, ["children", "onPress", "onLongPress", "onKeyDown", "disabled", "style", "disabledStyle", "hoverStyle", "focusStyle", "pressStyle", "screenReaderActiveStyle", "shouldUseHapticsOnLongPress", "shouldUseHapticsOnPress", "nextFocusRef", "keyboardShortcut", "shouldUseAutoHitSlop", "enableInScreenReaderStates", "onPressIn", "onPressOut", "accessible", "fullDisabled", "interactive", "isNested"]);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _r = (0, useSingleExecution_1.default)(), isExecuting = _r.isExecuting, singleExecution = _r.singleExecution;
    var isScreenReaderActive = Accessibility_1.default.useScreenReaderStatus();
    var _s = Accessibility_1.default.useAutoHitSlop(), hitSlop = _s[0], onLayout = _s[1];
    var _t = (0, react_1.useState)(false), isHovered = _t[0], setIsHovered = _t[1];
    var isDisabled = (0, react_1.useMemo)(function () {
        var shouldBeDisabledByScreenReader = false;
        if (enableInScreenReaderStates === CONST_1.default.SCREEN_READER_STATES.ACTIVE) {
            shouldBeDisabledByScreenReader = !isScreenReaderActive;
        }
        if (enableInScreenReaderStates === CONST_1.default.SCREEN_READER_STATES.DISABLED) {
            shouldBeDisabledByScreenReader = isScreenReaderActive;
        }
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return disabled || shouldBeDisabledByScreenReader || isExecuting;
    }, [isScreenReaderActive, enableInScreenReaderStates, disabled, isExecuting]);
    var shouldUseDisabledCursor = (0, react_1.useMemo)(function () { return isDisabled && !isExecuting; }, [isDisabled, isExecuting]);
    /**
     * Returns the cursor style based on the state of Pressable
     */
    var cursorStyle = (0, react_1.useMemo)(function () {
        if (!interactive) {
            return styles.cursorDefault;
        }
        if (shouldUseDisabledCursor) {
            return styles.cursorDisabled;
        }
        if ([rest.accessibilityRole, rest.role].includes(CONST_1.default.ROLE.PRESENTATION) && !isNested) {
            return styles.cursorText;
        }
        return styles.cursorPointer;
    }, [interactive, shouldUseDisabledCursor, rest.accessibilityRole, rest.role, isNested, styles.cursorPointer, styles.cursorDefault, styles.cursorDisabled, styles.cursorText]);
    var onLongPressHandler = (0, react_1.useCallback)(function (event) {
        var _a;
        if (isDisabled) {
            return;
        }
        if (!onLongPress) {
            return;
        }
        if (shouldUseHapticsOnLongPress) {
            HapticFeedback_1.default.longPress();
        }
        if (ref && 'current' in ref && nextFocusRef) {
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.blur();
            Accessibility_1.default.moveAccessibilityFocus(nextFocusRef);
        }
        onLongPress(event);
    }, [shouldUseHapticsOnLongPress, onLongPress, nextFocusRef, ref, isDisabled]);
    var onPressHandler = (0, react_1.useCallback)(function (event) {
        var _a;
        if (isDisabled || !interactive) {
            return;
        }
        if (!onPress) {
            return;
        }
        if (shouldUseHapticsOnPress) {
            HapticFeedback_1.default.press();
        }
        if (ref && 'current' in ref && nextFocusRef) {
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.blur();
            Accessibility_1.default.moveAccessibilityFocus(nextFocusRef);
        }
        return onPress(event);
    }, [shouldUseHapticsOnPress, onPress, nextFocusRef, ref, isDisabled, interactive]);
    var voidOnPressHandler = (0, react_1.useCallback)(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        onPressHandler.apply(void 0, args);
    }, [onPressHandler]);
    var onKeyboardShortcutPressHandler = (0, react_1.useCallback)(function (event) {
        onPressHandler(event);
    }, [onPressHandler]);
    (0, react_1.useEffect)(function () {
        if (!keyboardShortcut) {
            return function () { };
        }
        var shortcutKey = keyboardShortcut.shortcutKey, descriptionKey = keyboardShortcut.descriptionKey, modifiers = keyboardShortcut.modifiers;
        return KeyboardShortcut_1.default.subscribe(shortcutKey, onKeyboardShortcutPressHandler, descriptionKey, modifiers, true, false, 0, false);
    }, [keyboardShortcut, onKeyboardShortcutPressHandler]);
    return (<react_native_1.Pressable hitSlop={shouldUseAutoHitSlop ? hitSlop : undefined} onLayout={shouldUseAutoHitSlop ? onLayout : undefined} ref={ref} disabled={fullDisabled} 
    // eslint-disable-next-line react-compiler/react-compiler
    onPress={!isDisabled ? singleExecution(onPressHandler) : undefined} onLongPress={!isDisabled && onLongPress ? onLongPressHandler : undefined} onKeyDown={!isDisabled ? onKeyDown : undefined} onPressIn={!isDisabled ? onPressIn : undefined} onPressOut={!isDisabled ? onPressOut : undefined} style={function (state) { return [
            cursorStyle,
            StyleUtils.parseStyleFromFunction(style, state),
            isScreenReaderActive && StyleUtils.parseStyleFromFunction(screenReaderActiveStyle, state),
            state.focused && StyleUtils.parseStyleFromFunction(focusStyle, state),
            (state.hovered || isHovered) && StyleUtils.parseStyleFromFunction(hoverStyle, state),
            state.pressed && StyleUtils.parseStyleFromFunction(pressStyle, state),
            isDisabled && [StyleUtils.parseStyleFromFunction(disabledStyle, state), styles.noSelect],
        ]; }} 
    // accessibility props
    accessibilityState={__assign({ disabled: isDisabled }, rest.accessibilityState)} aria-disabled={isDisabled} aria-keyshortcuts={keyboardShortcut && "".concat(keyboardShortcut.modifiers.join(''), "+").concat(keyboardShortcut.shortcutKey)} 
    // ios-only form of inputs
    onMagicTap={!isDisabled ? voidOnPressHandler : undefined} onAccessibilityTap={!isDisabled ? voidOnPressHandler : undefined} accessible={accessible} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} onHoverOut={function (event) {
            if ((event === null || event === void 0 ? void 0 : event.type) === 'pointerenter' || (event === null || event === void 0 ? void 0 : event.type) === 'mouseenter') {
                return;
            }
            setIsHovered(false);
            if (rest.onHoverOut) {
                rest.onHoverOut(event);
            }
        }} onHoverIn={function (event) {
            setIsHovered(true);
            if (rest.onHoverIn) {
                rest.onHoverIn(event);
            }
        }}>
            {function (state) { return (typeof children === 'function' ? children(__assign(__assign({}, state), { isScreenReaderActive: isScreenReaderActive, hovered: state.hovered || isHovered, isDisabled: isDisabled })) : children); }}
        </react_native_1.Pressable>);
}
GenericPressable.displayName = 'GenericPressable';
exports.default = (0, react_1.forwardRef)(GenericPressable);
