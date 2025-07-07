"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stack_1 = require("@react-navigation/stack");
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function BaseOverlay(_a) {
    var onPress = _a.onPress, _b = _a.isModalOnTheLeft, isModalOnTheLeft = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var current = (0, stack_1.useCardAnimation)().current;
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.Animated.View id="BaseOverlay" style={styles.overlayStyles(current, isModalOnTheLeft)}>
            <react_native_1.View style={[styles.flex1, styles.flexColumn]}>
                {/* In the latest Electron version buttons can't be both clickable and draggable.
     That's why we added this workaround. Because of two Pressable components on the desktop app
     we have 30px draggable ba at the top and the rest of the dimmed area is clickable. On other devices,
     everything behaves normally like one big pressable */}
                <PressableWithoutFeedback_1.default style={[styles.draggableTopBar, styles.boxShadowNone]} onPress={onPress} accessibilityLabel={translate('common.close')} role={CONST_1.default.ROLE.BUTTON} id={CONST_1.default.OVERLAY.TOP_BUTTON_NATIVE_ID} tabIndex={-1}/>
                <PressableWithoutFeedback_1.default style={[styles.flex1, styles.boxShadowNone]} onPress={onPress} accessibilityLabel={translate('common.close')} role={CONST_1.default.ROLE.BUTTON} noDragArea id={CONST_1.default.OVERLAY.BOTTOM_BUTTON_NATIVE_ID} tabIndex={-1}/>
            </react_native_1.View>
        </react_native_1.Animated.View>);
}
BaseOverlay.displayName = 'BaseOverlay';
exports.default = BaseOverlay;
