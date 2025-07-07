"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
var OFFSET_X = {
    OFF: 0,
    ON: 20,
};
function Switch(_a) {
    var isOn = _a.isOn, onToggle = _a.onToggle, accessibilityLabel = _a.accessibilityLabel, disabled = _a.disabled, showLockIcon = _a.showLockIcon, disabledAction = _a.disabledAction;
    var styles = (0, useThemeStyles_1.default)();
    var offsetX = (0, react_native_reanimated_1.useSharedValue)(isOn ? OFFSET_X.ON : OFFSET_X.OFF);
    var theme = (0, useTheme_1.default)();
    (0, react_1.useEffect)(function () {
        offsetX.set((0, react_native_reanimated_1.withTiming)(isOn ? OFFSET_X.ON : OFFSET_X.OFF, { duration: 300 }));
    }, [isOn, offsetX]);
    var handleSwitchPress = function () {
        requestAnimationFrame(function () {
            if (disabled) {
                disabledAction === null || disabledAction === void 0 ? void 0 : disabledAction();
                return;
            }
            onToggle(!isOn);
        });
    };
    var animatedThumbStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        transform: [{ translateX: offsetX.get() }],
    }); });
    var animatedSwitchTrackStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        backgroundColor: (0, react_native_reanimated_1.interpolateColor)(offsetX.get(), [OFFSET_X.OFF, OFFSET_X.ON], [theme.icon, theme.success]),
    }); });
    return (<PressableWithFeedback_1.default disabled={!disabledAction && disabled} onPress={handleSwitchPress} onLongPress={handleSwitchPress} role={CONST_1.default.ROLE.SWITCH} aria-checked={isOn} accessibilityLabel={accessibilityLabel} 
    // disable hover dim for switch
    hoverDimmingValue={1} pressDimmingValue={0.8}>
            <react_native_reanimated_1.default.View style={[styles.switchTrack, animatedSwitchTrackStyle]}>
                <react_native_reanimated_1.default.View style={[styles.switchThumb, animatedThumbStyle]}>
                    {(!!disabled || !!showLockIcon) && (<Icon_1.default src={Expensicons.Lock} fill={isOn ? theme.text : theme.icon} width={styles.toggleSwitchLockIcon.width} height={styles.toggleSwitchLockIcon.height}/>)}
                </react_native_reanimated_1.default.View>
            </react_native_reanimated_1.default.View>
        </PressableWithFeedback_1.default>);
}
Switch.displayName = 'Switch';
exports.default = Switch;
