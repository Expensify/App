"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var new_expensify_dark_svg_1 = require("@assets/images/new-expensify-dark.svg");
var ImageSVG_1 = require("@components/ImageSVG");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BootSplash_1 = require("@libs/BootSplash");
function SplashScreenHider(_a) {
    var _b = _a.onHide, onHide = _b === void 0 ? function () { } : _b;
    var styles = (0, useThemeStyles_1.default)();
    var logoSizeRatio = BootSplash_1.default.logoSizeRatio || 1;
    var opacity = (0, react_native_reanimated_1.useSharedValue)(1);
    var scale = (0, react_native_reanimated_1.useSharedValue)(1);
    var opacityStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        opacity: opacity.get(),
    }); });
    var scaleStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        transform: [{ scale: scale.get() }],
    }); });
    var hideHasBeenCalled = (0, react_1.useRef)(false);
    var hide = (0, react_1.useCallback)(function () {
        // hide can only be called once
        if (hideHasBeenCalled.current) {
            return;
        }
        hideHasBeenCalled.current = true;
        BootSplash_1.default.hide().then(function () {
            scale.set((0, react_native_reanimated_1.withTiming)(0, {
                duration: 200,
                easing: react_native_reanimated_1.Easing.back(2),
            }));
            opacity.set((0, react_native_reanimated_1.withTiming)(0, {
                duration: 250,
                easing: react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.ease),
            }, function () { return (0, react_native_reanimated_1.runOnJS)(onHide)(); }));
        });
    }, [opacity, scale, onHide]);
    return (<react_native_reanimated_1.default.View style={[react_native_1.StyleSheet.absoluteFill, styles.splashScreenHider, opacityStyle]}>
            <react_native_reanimated_1.default.View style={scaleStyle}>
                <ImageSVG_1.default onLoadEnd={hide} contentFit="fill" style={{ width: 100 * logoSizeRatio, height: 100 * logoSizeRatio }} src={new_expensify_dark_svg_1.default}/>
            </react_native_reanimated_1.default.View>
        </react_native_reanimated_1.default.View>);
}
SplashScreenHider.displayName = 'SplashScreenHider';
exports.default = SplashScreenHider;
