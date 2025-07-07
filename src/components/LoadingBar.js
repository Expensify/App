"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function LoadingBar(_a) {
    var shouldShow = _a.shouldShow;
    var left = (0, react_native_reanimated_1.useSharedValue)(0);
    var width = (0, react_native_reanimated_1.useSharedValue)(0);
    var opacity = (0, react_native_reanimated_1.useSharedValue)(0);
    var styles = (0, useThemeStyles_1.default)();
    (0, react_1.useEffect)(function () {
        if (shouldShow) {
            // eslint-disable-next-line react-compiler/react-compiler
            left.set(0);
            width.set(0);
            opacity.set((0, react_native_reanimated_1.withTiming)(1, { duration: CONST_1.default.ANIMATED_PROGRESS_BAR_OPACITY_DURATION }));
            left.set((0, react_native_reanimated_1.withDelay)(CONST_1.default.ANIMATED_PROGRESS_BAR_DELAY, (0, react_native_reanimated_1.withRepeat)((0, react_native_reanimated_1.withSequence)((0, react_native_reanimated_1.withTiming)(0, { duration: 0 }), (0, react_native_reanimated_1.withTiming)(0, { duration: CONST_1.default.ANIMATED_PROGRESS_BAR_DURATION, easing: react_native_reanimated_1.Easing.bezier(0.65, 0, 0.35, 1) }), (0, react_native_reanimated_1.withTiming)(100, { duration: CONST_1.default.ANIMATED_PROGRESS_BAR_DURATION, easing: react_native_reanimated_1.Easing.bezier(0.65, 0, 0.35, 1) })), -1, false)));
            width.set((0, react_native_reanimated_1.withDelay)(CONST_1.default.ANIMATED_PROGRESS_BAR_DELAY, (0, react_native_reanimated_1.withRepeat)((0, react_native_reanimated_1.withSequence)((0, react_native_reanimated_1.withTiming)(0, { duration: 0 }), (0, react_native_reanimated_1.withTiming)(100, { duration: CONST_1.default.ANIMATED_PROGRESS_BAR_DURATION, easing: react_native_reanimated_1.Easing.bezier(0.65, 0, 0.35, 1) }), (0, react_native_reanimated_1.withTiming)(0, { duration: CONST_1.default.ANIMATED_PROGRESS_BAR_DURATION, easing: react_native_reanimated_1.Easing.bezier(0.65, 0, 0.35, 1) })), -1, false)));
        }
        else {
            opacity.set((0, react_native_reanimated_1.withTiming)(0, { duration: CONST_1.default.ANIMATED_PROGRESS_BAR_OPACITY_DURATION }, function () {
                (0, react_native_reanimated_1.cancelAnimation)(left);
                (0, react_native_reanimated_1.cancelAnimation)(width);
            }));
        }
        // we want to update only when shouldShow changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldShow]);
    var animatedIndicatorStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        left: "".concat(left.get(), "%"),
        width: "".concat(width.get(), "%"),
    }); });
    var animatedContainerStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        opacity: opacity.get(),
    }); });
    return (<react_native_reanimated_1.default.View style={[styles.progressBarWrapper, animatedContainerStyle]}>
            <react_native_reanimated_1.default.View style={[styles.progressBar, animatedIndicatorStyle]}/>
        </react_native_reanimated_1.default.View>);
}
LoadingBar.displayName = 'ProgressBar';
exports.default = LoadingBar;
