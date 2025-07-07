"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function Accordion(_a) {
    var isExpanded = _a.isExpanded, children = _a.children, _b = _a.duration, duration = _b === void 0 ? 300 : _b, isToggleTriggered = _a.isToggleTriggered, style = _a.style;
    var height = (0, react_native_reanimated_1.useSharedValue)(0);
    var styles = (0, useThemeStyles_1.default)();
    var derivedHeight = (0, react_native_reanimated_1.useDerivedValue)(function () {
        if (!isToggleTriggered.get()) {
            return isExpanded.get() ? height.get() : 0;
        }
        return (0, react_native_reanimated_1.withTiming)(height.get() * Number(isExpanded.get()), {
            duration: duration,
            easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.quad),
        });
    });
    var derivedOpacity = (0, react_native_reanimated_1.useDerivedValue)(function () {
        if (!isToggleTriggered.get()) {
            return isExpanded.get() ? 1 : 0;
        }
        return (0, react_native_reanimated_1.withTiming)(isExpanded.get() ? 1 : 0, {
            duration: duration,
            easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.quad),
        });
    });
    var animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        if (!isToggleTriggered.get() && !isExpanded.get()) {
            return {
                height: 0,
                opacity: 0,
            };
        }
        return {
            height: !isToggleTriggered.get() ? height.get() : derivedHeight.get(),
            opacity: derivedOpacity.get(),
        };
    });
    return (<react_native_reanimated_1.default.View style={[animatedStyle, style]}>
            <react_native_1.View onLayout={function (e) {
            height.set(e.nativeEvent.layout.height);
        }} style={[styles.pAbsolute, styles.l0, styles.r0, styles.t0]}>
                {children}
            </react_native_1.View>
        </react_native_reanimated_1.default.View>);
}
Accordion.displayName = 'Accordion';
exports.default = Accordion;
