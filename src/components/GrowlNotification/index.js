"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Pressables = require("@components/Pressable");
var Text_1 = require("@components/Text");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Growl = require("@libs/Growl");
var CONST_1 = require("@src/CONST");
var GrowlNotificationContainer_1 = require("./GrowlNotificationContainer");
var INACTIVE_POSITION_Y = -255;
var PressableWithoutFeedback = Pressables.PressableWithoutFeedback;
function GrowlNotification(_, ref) {
    var _a;
    var translateY = (0, react_native_reanimated_1.useSharedValue)(INACTIVE_POSITION_Y);
    var _b = (0, react_1.useState)(''), bodyText = _b[0], setBodyText = _b[1];
    var _c = (0, react_1.useState)('success'), type = _c[0], setType = _c[1];
    var _d = (0, react_1.useState)(), duration = _d[0], setDuration = _d[1];
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var types = (_a = {},
        _a[CONST_1.default.GROWL.SUCCESS] = {
            icon: Expensicons.Checkmark,
            iconColor: theme.success,
        },
        _a[CONST_1.default.GROWL.ERROR] = {
            icon: Expensicons.Exclamation,
            iconColor: theme.danger,
        },
        _a[CONST_1.default.GROWL.WARNING] = {
            icon: Expensicons.Exclamation,
            iconColor: theme.warning,
        },
        _a);
    /**
     * Show the growl notification
     *
     * @param {String} bodyText
     * @param {String} type
     * @param {Number} duration
     */
    var show = (0, react_1.useCallback)(function (text, growlType, growlDuration) {
        setBodyText(text);
        setType(growlType);
        setDuration(growlDuration);
    }, []);
    /**
     * Animate growl notification
     *
     * @param {Number} val
     */
    var fling = (0, react_1.useCallback)(function (val) {
        'worklet';
        if (val === void 0) { val = INACTIVE_POSITION_Y; }
        translateY.set((0, react_native_reanimated_1.withSpring)(val, {
            overshootClamping: false,
        }));
    }, [translateY]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        show: show,
    }); }, [show]);
    (0, react_1.useEffect)(function () {
        Growl.setIsReady();
    }, []);
    (0, react_1.useEffect)(function () {
        if (!duration) {
            return;
        }
        fling(0);
        setTimeout(function () {
            fling();
            setDuration(undefined);
        }, duration);
    }, [duration, fling]);
    // GestureDetector by default runs callbacks on UI thread using Reanimated. In this
    // case we want to trigger an RN's Animated animation, which needs to be done on JS thread.
    var flingGesture = react_native_gesture_handler_1.Gesture.Fling()
        .direction(react_native_gesture_handler_1.Directions.UP)
        .runOnJS(true)
        .onStart(function () {
        fling();
    });
    return (<react_native_1.View style={[styles.growlNotificationWrapper]}>
            <GrowlNotificationContainer_1.default translateY={translateY}>
                <PressableWithoutFeedback accessibilityLabel={bodyText} onPress={function () { return fling(); }}>
                    <react_native_gesture_handler_1.GestureDetector gesture={flingGesture}>
                        <react_native_1.View style={styles.growlNotificationBox}>
                            <Icon_1.default src={types[type].icon} fill={types[type].iconColor}/>
                            <Text_1.default style={styles.growlNotificationText}>{bodyText}</Text_1.default>
                        </react_native_1.View>
                    </react_native_gesture_handler_1.GestureDetector>
                </PressableWithoutFeedback>
            </GrowlNotificationContainer_1.default>
        </react_native_1.View>);
}
GrowlNotification.displayName = 'GrowlNotification';
exports.default = (0, react_1.forwardRef)(GrowlNotification);
