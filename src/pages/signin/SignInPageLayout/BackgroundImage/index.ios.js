"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_1 = require("expo-image");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var home_background__desktop_svg_1 = require("@assets/images/home-background--desktop.svg");
var home_background__mobile_new_svg_1 = require("@assets/images/home-background--mobile-new.svg");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
var CONST_1 = require("@src/CONST");
var SplashScreenStateContext_1 = require("@src/SplashScreenStateContext");
function BackgroundImage(_a) {
    var width = _a.width, transitionDuration = _a.transitionDuration, _b = _a.isSmallScreen, isSmallScreen = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var src = (0, react_1.useMemo)(function () { return (isSmallScreen ? home_background__mobile_new_svg_1.default : home_background__desktop_svg_1.default); }, [isSmallScreen]);
    var _c = (0, react_1.useState)(false), isInteractionComplete = _c[0], setIsInteractionComplete = _c[1];
    var isAnonymous = (0, Session_1.isAnonymousUser)();
    var opacity = (0, react_native_reanimated_1.useSharedValue)(0);
    var animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({ opacity: opacity.get() }); });
    // This sets the opacity animation for the background image once it has loaded.
    function setOpacityAnimation() {
        opacity.set((0, react_native_reanimated_1.withTiming)(1, {
            duration: CONST_1.default.MICROSECONDS_PER_MS,
            easing: react_native_reanimated_1.Easing.ease,
        }));
    }
    (0, react_1.useEffect)(function () {
        if (!isAnonymous) {
            return;
        }
        var interactionTask = react_native_1.InteractionManager.runAfterInteractions(function () {
            setIsInteractionComplete(true);
        });
        return function () {
            interactionTask.cancel();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var splashScreenState = (0, SplashScreenStateContext_1.useSplashScreenStateContext)().splashScreenState;
    // Prevent rendering the background image until the splash screen is hidden.
    // See issue: https://github.com/Expensify/App/issues/34696
    if (splashScreenState !== CONST_1.default.BOOT_SPLASH_STATE.HIDDEN || (!isInteractionComplete && isAnonymous)) {
        return;
    }
    return (<react_native_reanimated_1.default.View style={[styles.signInBackground, StyleUtils.getWidthStyle(width), animatedStyle]}>
            <expo_image_1.Image source={src} onLoadEnd={function () { return setOpacityAnimation(); }} style={[styles.signInBackground, StyleUtils.getWidthStyle(width)]} transition={transitionDuration}/>
        </react_native_reanimated_1.default.View>);
}
BackgroundImage.displayName = 'BackgroundImage';
exports.default = BackgroundImage;
