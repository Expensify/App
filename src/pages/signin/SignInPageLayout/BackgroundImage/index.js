"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var home_background__desktop_svg_1 = require("@assets/images/home-background--desktop.svg");
var home_background__mobile_svg_1 = require("@assets/images/home-background--mobile.svg");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
function BackgroundImage(_a) {
    var width = _a.width, transitionDuration = _a.transitionDuration, _b = _a.isSmallScreen, isSmallScreen = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(false), isInteractionComplete = _c[0], setIsInteractionComplete = _c[1];
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
    if (!isInteractionComplete && isAnonymous) {
        return;
    }
    if (isSmallScreen) {
        return (<react_native_reanimated_1.default.View style={styles.signInBackground} entering={react_native_reanimated_1.FadeIn.duration(transitionDuration)}>
                <home_background__mobile_svg_1.default width={width} style={styles.signInBackground}/>
            </react_native_reanimated_1.default.View>);
    }
    return (<react_native_reanimated_1.default.View style={styles.signInBackground} entering={react_native_reanimated_1.FadeIn.duration(transitionDuration)}>
            <home_background__desktop_svg_1.default width={width} style={styles.signInBackground}/>
        </react_native_reanimated_1.default.View>);
}
BackgroundImage.displayName = 'BackgroundImage';
exports.default = BackgroundImage;
