"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Pressable_1 = require("@components/Pressable");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var easing = react_native_reanimated_1.Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();
function Backdrop(_a) {
    var _b, _c;
    var style = _a.style, customBackdrop = _a.customBackdrop, onBackdropPress = _a.onBackdropPress, _d = _a.animationInTiming, animationInTiming = _d === void 0 ? CONST_1.default.MODAL.ANIMATION_TIMING.DEFAULT_IN : _d, _e = _a.animationOutTiming, animationOutTiming = _e === void 0 ? CONST_1.default.MODAL.ANIMATION_TIMING.DEFAULT_OUT : _e, isBackdropVisible = _a.isBackdropVisible, _f = _a.backdropOpacity, backdropOpacity = _f === void 0 ? variables_1.default.overlayOpacity : _f;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var Entering = (0, react_1.useMemo)(function () {
        var FadeIn = new react_native_reanimated_1.Keyframe({
            from: { opacity: 0 },
            to: {
                opacity: 0.72,
                easing: easing,
            },
        });
        return FadeIn.duration(animationInTiming);
    }, [animationInTiming]);
    var Exiting = (0, react_1.useMemo)(function () {
        var FadeOut = new react_native_reanimated_1.Keyframe({
            from: { opacity: 0.72 },
            to: {
                opacity: 0,
                easing: easing,
            },
        });
        return FadeOut.duration(animationOutTiming);
    }, [animationOutTiming]);
    var backdropStyle = (0, react_1.useMemo)(function () { return ({
        opacity: backdropOpacity,
    }); }, [backdropOpacity]);
    if (!customBackdrop) {
        return (<Pressable_1.PressableWithoutFeedback accessible accessibilityLabel={translate('modal.backdropLabel')} onPress={onBackdropPress} style={[styles.userSelectNone, styles.cursorAuto]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                {isBackdropVisible && (<react_native_reanimated_1.default.View style={[styles.modalBackdrop, backdropStyle, style]} entering={Entering} exiting={Exiting}/>)}
            </Pressable_1.PressableWithoutFeedback>);
    }
    return (isBackdropVisible && (<react_native_reanimated_1.default.View entering={Entering} exiting={Exiting} style={[styles.userSelectNone]} dataSet={_c = {}, _c[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _c}>
                <react_native_1.View style={[styles.modalBackdrop, backdropStyle, style]}>{!!customBackdrop && customBackdrop}</react_native_1.View>
            </react_native_reanimated_1.default.View>));
}
Backdrop.displayName = 'Backdrop';
exports.default = Backdrop;
