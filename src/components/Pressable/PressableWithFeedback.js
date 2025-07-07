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
var OpacityView_1 = require("@components/OpacityView");
var variables_1 = require("@styles/variables");
var GenericPressable_1 = require("./GenericPressable");
function PressableWithFeedback(_a, ref) {
    var children = _a.children, _b = _a.wrapperStyle, wrapperStyle = _b === void 0 ? [] : _b, _c = _a.needsOffscreenAlphaCompositing, needsOffscreenAlphaCompositing = _c === void 0 ? false : _c, _d = _a.pressDimmingValue, pressDimmingValue = _d === void 0 ? variables_1.default.pressDimValue : _d, _e = _a.hoverDimmingValue, hoverDimmingValue = _e === void 0 ? variables_1.default.hoverDimValue : _e, dimAnimationDuration = _a.dimAnimationDuration, shouldBlendOpacity = _a.shouldBlendOpacity, rest = __rest(_a, ["children", "wrapperStyle", "needsOffscreenAlphaCompositing", "pressDimmingValue", "hoverDimmingValue", "dimAnimationDuration", "shouldBlendOpacity"]);
    var _f = (0, react_1.useState)(false), isPressed = _f[0], setIsPressed = _f[1];
    var _g = (0, react_1.useState)(false), isHovered = _g[0], setIsHovered = _g[1];
    return (<OpacityView_1.default shouldDim={!shouldBlendOpacity && !!(!rest.disabled && (isPressed || isHovered))} dimmingValue={isPressed ? pressDimmingValue : hoverDimmingValue} dimAnimationDuration={dimAnimationDuration} style={wrapperStyle} needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}>
            <GenericPressable_1.default ref={ref} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} disabled={rest.disabled} onHoverIn={function (event) {
            setIsHovered(true);
            if (rest.onHoverIn) {
                rest.onHoverIn(event);
            }
        }} onHoverOut={function (event) {
            setIsHovered(false);
            if (rest.onHoverOut) {
                rest.onHoverOut(event);
            }
        }} onPressIn={function (event) {
            setIsPressed(true);
            if (rest.onPressIn) {
                rest.onPressIn(event);
            }
        }} onPressOut={function (event) {
            setIsPressed(false);
            if (rest.onPressOut) {
                rest.onPressOut(event);
            }
        }}>
                {function (state) { return (typeof children === 'function' ? children(state) : children); }}
            </GenericPressable_1.default>
        </OpacityView_1.default>);
}
PressableWithFeedback.displayName = 'PressableWithFeedback';
exports.default = (0, react_1.forwardRef)(PressableWithFeedback);
