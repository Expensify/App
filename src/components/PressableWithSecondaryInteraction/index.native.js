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
var Text_1 = require("@components/Text");
/** This is a special Pressable that calls onSecondaryInteraction when LongPressed. */
function PressableWithSecondaryInteraction(_a, ref) {
    var children = _a.children, onSecondaryInteraction = _a.onSecondaryInteraction, _b = _a.inline, inline = _b === void 0 ? false : _b, _c = _a.needsOffscreenAlphaCompositing, needsOffscreenAlphaCompositing = _c === void 0 ? false : _c, _d = _a.suppressHighlighting, suppressHighlighting = _d === void 0 ? false : _d, _e = _a.activeOpacity, activeOpacity = _e === void 0 ? 1 : _e, preventDefaultContextMenu = _a.preventDefaultContextMenu, withoutFocusOnSecondaryInteraction = _a.withoutFocusOnSecondaryInteraction, enableLongPressWithHover = _a.enableLongPressWithHover, rest = __rest(_a, ["children", "onSecondaryInteraction", "inline", "needsOffscreenAlphaCompositing", "suppressHighlighting", "activeOpacity", "preventDefaultContextMenu", "withoutFocusOnSecondaryInteraction", "enableLongPressWithHover"]);
    var executeSecondaryInteraction = function (event) {
        event.preventDefault();
        onSecondaryInteraction === null || onSecondaryInteraction === void 0 ? void 0 : onSecondaryInteraction(event);
    };
    // Use Text node for inline mode to prevent content overflow.
    if (inline) {
        return (<Text_1.default 
        // ESLint is disabled here to propagate all the props, enhancing PressableWithSecondaryInteraction's versatility across different use cases.
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest} suppressHighlighting={suppressHighlighting} onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}>
                {children}
            </Text_1.default>);
    }
    return (<PressableWithFeedback_1.default 
    // ESLint is disabled here to propagate all the props, enhancing PressableWithSecondaryInteraction's versatility across different use cases.
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} ref={ref} onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined} needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing} pressDimmingValue={activeOpacity}>
            {children}
        </PressableWithFeedback_1.default>);
}
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';
exports.default = (0, react_1.forwardRef)(PressableWithSecondaryInteraction);
