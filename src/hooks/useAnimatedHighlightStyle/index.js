"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useAnimatedHighlightStyle;
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var useScreenWrapperTransitionStatus_1 = require("@hooks/useScreenWrapperTransitionStatus");
var useTheme_1 = require("@hooks/useTheme");
var CONST_1 = require("@src/CONST");
/**
 * Returns a highlight style that interpolates the color, height and opacity giving a fading effect.
 */
function useAnimatedHighlightStyle(_a) {
    var borderRadius = _a.borderRadius, shouldHighlight = _a.shouldHighlight, _b = _a.itemEnterDelay, itemEnterDelay = _b === void 0 ? CONST_1.default.ANIMATED_HIGHLIGHT_ENTRY_DELAY : _b, _c = _a.itemEnterDuration, itemEnterDuration = _c === void 0 ? CONST_1.default.ANIMATED_HIGHLIGHT_ENTRY_DURATION : _c, _d = _a.highlightStartDelay, highlightStartDelay = _d === void 0 ? CONST_1.default.ANIMATED_HIGHLIGHT_START_DELAY : _d, _e = _a.highlightStartDuration, highlightStartDuration = _e === void 0 ? CONST_1.default.ANIMATED_HIGHLIGHT_START_DURATION : _e, _f = _a.highlightEndDelay, highlightEndDelay = _f === void 0 ? CONST_1.default.ANIMATED_HIGHLIGHT_END_DELAY : _f, _g = _a.highlightEndDuration, highlightEndDuration = _g === void 0 ? CONST_1.default.ANIMATED_HIGHLIGHT_END_DURATION : _g, height = _a.height, highlightColor = _a.highlightColor, backgroundColor = _a.backgroundColor;
    var _h = (0, react_1.useState)(false), startHighlight = _h[0], setStartHighlight = _h[1];
    var repeatableProgress = (0, react_native_reanimated_1.useSharedValue)(0);
    var nonRepeatableProgress = (0, react_native_reanimated_1.useSharedValue)(shouldHighlight ? 0 : 1);
    var didScreenTransitionEnd = (0, useScreenWrapperTransitionStatus_1.default)().didScreenTransitionEnd;
    var theme = (0, useTheme_1.default)();
    var highlightBackgroundStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        'worklet';
        var repeatableValue = repeatableProgress.get();
        var nonRepeatableValue = nonRepeatableProgress.get();
        return {
            backgroundColor: (0, react_native_reanimated_1.interpolateColor)(repeatableValue, [0, 1], [backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.appBG, highlightColor !== null && highlightColor !== void 0 ? highlightColor : theme.border]),
            height: height ? (0, react_native_reanimated_1.interpolate)(nonRepeatableValue, [0, 1], [0, height]) : 'auto',
            opacity: (0, react_native_reanimated_1.interpolate)(nonRepeatableValue, [0, 1], [0, 1]),
            borderRadius: borderRadius,
        };
    }, [borderRadius, height, backgroundColor, highlightColor, theme.appBG, theme.border]);
    react_1.default.useEffect(function () {
        if (!shouldHighlight || startHighlight) {
            return;
        }
        setStartHighlight(true);
        // We only need to add shouldHighlight as a dependency and adding startHighlight as deps will cause a loop because
        // if shouldHighlight stays at true the above early return will not be executed and this useEffect will be run
        // as long as shouldHighlight is true as we set startHighlight to false in the below useEffect.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldHighlight]);
    react_1.default.useEffect(function () {
        if (!startHighlight || !didScreenTransitionEnd) {
            return;
        }
        setStartHighlight(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            (0, react_native_reanimated_1.runOnJS)(function () {
                nonRepeatableProgress.set((0, react_native_reanimated_1.withDelay)(itemEnterDelay, (0, react_native_reanimated_1.withTiming)(1, { duration: itemEnterDuration, easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.ease) }, function (finished) {
                    if (!finished) {
                        return;
                    }
                    repeatableProgress.set((0, react_native_reanimated_1.withSequence)((0, react_native_reanimated_1.withDelay)(highlightStartDelay, (0, react_native_reanimated_1.withTiming)(1, { duration: highlightStartDuration, easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.ease) })), (0, react_native_reanimated_1.withDelay)(highlightEndDelay, (0, react_native_reanimated_1.withTiming)(0, { duration: highlightEndDuration, easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.ease) }))));
                })));
            })();
        });
    }, [
        didScreenTransitionEnd,
        startHighlight,
        itemEnterDelay,
        itemEnterDuration,
        highlightStartDelay,
        highlightStartDuration,
        highlightEndDelay,
        highlightEndDuration,
        repeatableProgress,
        nonRepeatableProgress,
    ]);
    return highlightBackgroundStyle;
}
