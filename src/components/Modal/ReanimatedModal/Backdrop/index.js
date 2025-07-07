"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var utils_1 = require("@components/Modal/ReanimatedModal/utils");
var Pressable_1 = require("@components/Pressable");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function Backdrop(_a) {
    var style = _a.style, customBackdrop = _a.customBackdrop, onBackdropPress = _a.onBackdropPress, _b = _a.animationInTiming, animationInTiming = _b === void 0 ? CONST_1.default.MODAL.ANIMATION_TIMING.DEFAULT_IN : _b, _c = _a.animationOutTiming, animationOutTiming = _c === void 0 ? CONST_1.default.MODAL.ANIMATION_TIMING.DEFAULT_OUT : _c;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var Entering = (0, react_1.useMemo)(function () {
        var FadeIn = new react_native_reanimated_1.Keyframe((0, utils_1.getModalInAnimation)('fadeIn'));
        return FadeIn.duration(animationInTiming);
    }, [animationInTiming]);
    var Exiting = (0, react_1.useMemo)(function () {
        var FadeOut = new react_native_reanimated_1.Keyframe((0, utils_1.getModalOutAnimation)('fadeOut'));
        return FadeOut.duration(animationOutTiming);
    }, [animationOutTiming]);
    var BackdropOverlay = (0, react_1.useMemo)(function () { return (<react_native_reanimated_1.default.View entering={Entering} exiting={Exiting} style={[styles.modalBackdrop, style]}>
                {!!customBackdrop && customBackdrop}
            </react_native_reanimated_1.default.View>); }, [Entering, Exiting, customBackdrop, style, styles.modalBackdrop]);
    if (!customBackdrop) {
        return (<Pressable_1.PressableWithoutFeedback accessible accessibilityLabel={translate('modal.backdropLabel')} onPressIn={onBackdropPress}>
                {BackdropOverlay}
            </Pressable_1.PressableWithoutFeedback>);
    }
    return BackdropOverlay;
}
Backdrop.displayName = 'Backdrop';
exports.default = Backdrop;
