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
var Pressable_1 = require("@components/Pressable");
/**
 * This component is a workaround to resolve an issue for an Android issue where onPress does not trigger on Mapbox.MapView due to a PanResponder that captures touch events.
 * Related issue: https://github.com/Expensify/App/issues/56499
 */
function ToggleDistanceUnitButton(_a) {
    var onPress = _a.onPress, children = _a.children, rest = __rest(_a, ["onPress", "children"]);
    var touchStartLocation = (0, react_1.useRef)(null);
    var handleTouchStart = function (event) {
        touchStartLocation.current = {
            x: event.nativeEvent.pageX,
            y: event.nativeEvent.pageY,
        };
    };
    var handleTouchMove = function (event) {
        if (!touchStartLocation.current) {
            return;
        }
        // Determine if the touch movement exceeds a small threshold (1 pixel in any direction)
        // If movement is detected, treat it as a drag and reset touch tracking
        var dx = Math.abs(event.nativeEvent.pageX - touchStartLocation.current.x);
        var dy = Math.abs(event.nativeEvent.pageY - touchStartLocation.current.y);
        if (dx > 1 || dy > 1) {
            touchStartLocation.current = null;
        }
    };
    var handleTouchEnd = function () {
        if (!touchStartLocation.current) {
            return;
        }
        onPress === null || onPress === void 0 ? void 0 : onPress();
        touchStartLocation.current = null;
    };
    return (<Pressable_1.PressableWithoutFeedback onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}>
            {children}
        </Pressable_1.PressableWithoutFeedback>);
}
ToggleDistanceUnitButton.displayName = 'ToggleDistanceUnitButton';
exports.default = ToggleDistanceUnitButton;
