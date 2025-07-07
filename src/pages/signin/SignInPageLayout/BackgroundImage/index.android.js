"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_1 = require("expo-image");
var react_1 = require("react");
var react_native_1 = require("react-native");
var home_background__android_svg_1 = require("@assets/images/home-background--android.svg");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
function BackgroundImage(_a) {
    var pointerEvents = _a.pointerEvents, width = _a.width, transitionDuration = _a.transitionDuration;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(false), isInteractionComplete = _b[0], setIsInteractionComplete = _b[1];
    var isAnonymous = (0, Session_1.isAnonymousUser)();
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
    // load the background image and Lottie animation only after user interactions to ensure smooth navigation transitions.
    if (!isInteractionComplete && isAnonymous) {
        return;
    }
    return (<expo_image_1.Image source={home_background__android_svg_1.default} pointerEvents={pointerEvents} style={[styles.signInBackground, { width: width }]} transition={transitionDuration}/>);
}
BackgroundImage.displayName = 'BackgroundImage';
exports.default = BackgroundImage;
