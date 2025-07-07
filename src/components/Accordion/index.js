"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
function Accordion(_a) {
    var isExpanded = _a.isExpanded, children = _a.children, _b = _a.duration, duration = _b === void 0 ? 300 : _b, isToggleTriggered = _a.isToggleTriggered, style = _a.style;
    var height = (0, react_native_reanimated_1.useSharedValue)(0);
    var isAnimating = (0, react_native_reanimated_1.useSharedValue)(false);
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
        isAnimating.set(true);
        return (0, react_native_reanimated_1.withTiming)(isExpanded.get() ? 1 : 0, {
            duration: duration,
            easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.quad),
        }, function (finished) {
            if (!finished || !isExpanded.get()) {
                return;
            }
            isAnimating.set(false);
        });
    });
    var animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        if (!isToggleTriggered.get() && !isExpanded.get()) {
            return {
                height: 0,
                opacity: 0,
                display: 'none',
            };
        }
        return {
            height: !isToggleTriggered.get() ? undefined : derivedHeight.get(),
            maxHeight: !isToggleTriggered.get() ? undefined : derivedHeight.get(),
            opacity: derivedOpacity.get(),
            overflow: isAnimating.get() ? 'hidden' : 'visible',
            display: isExpanded.get() ? 'inline' : 'none',
        };
    });
    return (<react_native_reanimated_1.default.View style={[animatedStyle, style]}>
            <react_native_1.View onLayout={function (e) {
            height.set(e.nativeEvent.layout.height);
        }}>
                {children}
            </react_native_1.View>
        </react_native_reanimated_1.default.View>);
}
Accordion.displayName = 'Accordion';
exports.default = Accordion;
