"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function SendButton(_a) {
    var isDisabledProp = _a.isDisabled, handleSendMessage = _a.handleSendMessage;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to manage GestureDetector correctly
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var Tap = react_native_gesture_handler_1.Gesture.Tap().onEnd(function () {
        handleSendMessage();
    });
    return (<react_native_1.View style={styles.justifyContentEnd} 
    // Keep focus on the composer when Send message is clicked.
    onMouseDown={function (e) { return e.preventDefault(); }}>
            <react_native_gesture_handler_1.GestureDetector 
    // A new GestureDetector instance must be created when switching from a large screen to a small screen
    // if not, the GestureDetector may not function correctly.
    key={"send-button-".concat(isSmallScreenWidth ? 'small-screen' : 'normal-screen')} gesture={Tap}>
                <react_native_1.View collapsable={false}>
                    <Tooltip_1.default text={translate('common.send')}>
                        <PressableWithFeedback_1.default style={function (_a) {
            var pressed = _a.pressed, isDisabled = _a.isDisabled;
            return [
                styles.chatItemSubmitButton,
                isDisabledProp || pressed || isDisabled ? undefined : styles.buttonSuccess,
                isDisabledProp ? styles.cursorDisabled : undefined,
            ];
        }} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.send')}>
                            {function (_a) {
            var pressed = _a.pressed;
            return (<Icon_1.default src={Expensicons.Send} fill={isDisabledProp || pressed ? theme.icon : theme.textLight}/>);
        }}
                        </PressableWithFeedback_1.default>
                    </Tooltip_1.default>
                </react_native_1.View>
            </react_native_gesture_handler_1.GestureDetector>
        </react_native_1.View>);
}
SendButton.displayName = 'SendButton';
exports.default = (0, react_1.memo)(SendButton);
