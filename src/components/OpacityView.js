"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var shouldRenderOffscreen_1 = require("@libs/shouldRenderOffscreen");
var variables_1 = require("@styles/variables");
function OpacityView(_a) {
    var shouldDim = _a.shouldDim, _b = _a.dimAnimationDuration, dimAnimationDuration = _b === void 0 ? variables_1.default.dimAnimationDuration : _b, children = _a.children, _c = _a.style, style = _c === void 0 ? [] : _c, _d = _a.dimmingValue, dimmingValue = _d === void 0 ? variables_1.default.hoverDimValue : _d, _e = _a.needsOffscreenAlphaCompositing, needsOffscreenAlphaCompositing = _e === void 0 ? false : _e;
    var opacity = (0, react_native_reanimated_1.useSharedValue)(1);
    var opacityStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        opacity: opacity.get(),
    }); });
    react_1.default.useEffect(function () {
        opacity.set((0, react_native_reanimated_1.withTiming)(shouldDim ? dimmingValue : 1, { duration: dimAnimationDuration }));
    }, [shouldDim, dimmingValue, opacity, dimAnimationDuration]);
    return (<react_native_reanimated_1.default.View style={[opacityStyle, style]} needsOffscreenAlphaCompositing={shouldRenderOffscreen_1.default ? needsOffscreenAlphaCompositing : undefined}>
            {children}
        </react_native_reanimated_1.default.View>);
}
OpacityView.displayName = 'OpacityView';
exports.default = OpacityView;
