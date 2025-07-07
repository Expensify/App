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
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities = require("@libs/DeviceCapabilities");
/** This is a special Pressable that calls onSecondaryInteraction when LongPressed, or right-clicked. */
function PressableWithSecondaryInteraction(_a, ref) {
    var children = _a.children, _b = _a.inline, inline = _b === void 0 ? false : _b, style = _a.style, wrapperStyle = _a.wrapperStyle, _c = _a.enableLongPressWithHover, enableLongPressWithHover = _c === void 0 ? false : _c, _d = _a.withoutFocusOnSecondaryInteraction, withoutFocusOnSecondaryInteraction = _d === void 0 ? false : _d, _e = _a.needsOffscreenAlphaCompositing, needsOffscreenAlphaCompositing = _e === void 0 ? false : _e, _f = _a.preventDefaultContextMenu, preventDefaultContextMenu = _f === void 0 ? true : _f, onSecondaryInteraction = _a.onSecondaryInteraction, _g = _a.activeOpacity, activeOpacity = _g === void 0 ? 1 : _g, opacityAnimationDuration = _a.opacityAnimationDuration, rest = __rest(_a, ["children", "inline", "style", "wrapperStyle", "enableLongPressWithHover", "withoutFocusOnSecondaryInteraction", "needsOffscreenAlphaCompositing", "preventDefaultContextMenu", "onSecondaryInteraction", "activeOpacity", "opacityAnimationDuration"]);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var pressableRef = (0, react_1.useRef)(null);
    var executeSecondaryInteraction = function (event) {
        if (DeviceCapabilities.hasHoverSupport() && !enableLongPressWithHover) {
            return;
        }
        if (withoutFocusOnSecondaryInteraction && pressableRef.current) {
            pressableRef.current.blur();
        }
        onSecondaryInteraction === null || onSecondaryInteraction === void 0 ? void 0 : onSecondaryInteraction(event);
    };
    (0, react_1.useEffect)(function () {
        if (!pressableRef.current) {
            return;
        }
        if (ref) {
            if (typeof ref === 'function') {
                ref(pressableRef.current);
            }
            else if (typeof ref === 'object') {
                // eslint-disable-next-line no-param-reassign
                ref.current = pressableRef.current;
            }
        }
        var element = pressableRef.current;
        /**
         * @param event - A right-click MouseEvent.
         * https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
         */
        var executeSecondaryInteractionOnContextMenu = function (event) {
            if (!onSecondaryInteraction) {
                return;
            }
            event.stopPropagation();
            if (preventDefaultContextMenu) {
                event.preventDefault();
            }
            onSecondaryInteraction(event);
            /**
             * This component prevents the tapped element from capturing focus.
             * We need to blur this element when clicked as it opens modal that implements focus-trapping.
             * When the modal is closed it focuses back to the last active element.
             * Therefore it shifts the element to bring it back to focus.
             * https://github.com/Expensify/App/issues/14148
             */
            if (withoutFocusOnSecondaryInteraction) {
                element.blur();
            }
        };
        element.addEventListener('contextmenu', executeSecondaryInteractionOnContextMenu);
        return function () {
            element.removeEventListener('contextmenu', executeSecondaryInteractionOnContextMenu);
        };
    }, [ref, onSecondaryInteraction, preventDefaultContextMenu, withoutFocusOnSecondaryInteraction]);
    var inlineStyle = inline ? styles.dInline : {};
    // On Web, Text does not support LongPress events thus manage inline mode with styling instead of using Text.
    return (<PressableWithFeedback_1.default 
    // ESLint is disabled here to propagate all the props, enhancing PressableWithSecondaryInteraction's versatility across different use cases.
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} wrapperStyle={[StyleUtils.combineStyles(DeviceCapabilities.canUseTouchScreen() ? [styles.userSelectNone, styles.noSelect] : [], inlineStyle), wrapperStyle]} onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined} pressDimmingValue={activeOpacity} dimAnimationDuration={opacityAnimationDuration} ref={pressableRef} style={function (state) { return [StyleUtils.parseStyleFromFunction(style, state), inlineStyle]; }} needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}>
            {children}
        </PressableWithFeedback_1.default>);
}
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';
exports.default = (0, react_1.forwardRef)(PressableWithSecondaryInteraction);
