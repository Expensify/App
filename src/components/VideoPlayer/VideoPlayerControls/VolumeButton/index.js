"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var Hoverable_1 = require("@components/Hoverable");
var Expensicons = require("@components/Icon/Expensicons");
var IconButton_1 = require("@components/VideoPlayer/IconButton");
var VolumeContext_1 = require("@components/VideoPlayerContexts/VolumeContext");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NumberUtils = require("@libs/NumberUtils");
var getVolumeIcon = function (volume) {
    if (volume === 0) {
        return Expensicons.Mute;
    }
    if (volume <= 0.5) {
        return Expensicons.VolumeLow;
    }
    return Expensicons.VolumeHigh;
};
function VolumeButton(_a) {
    var style = _a.style, _b = _a.small, small = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, VolumeContext_1.useVolumeContext)(), updateVolume = _c.updateVolume, volume = _c.volume, toggleMute = _c.toggleMute;
    var _d = (0, react_1.useState)(1), sliderHeight = _d[0], setSliderHeight = _d[1];
    var _e = (0, react_1.useState)({ icon: getVolumeIcon(volume.get()) }), volumeIcon = _e[0], setVolumeIcon = _e[1];
    var _f = (0, react_1.useState)(false), isSliderBeingUsed = _f[0], setIsSliderBeingUsed = _f[1];
    var onSliderLayout = (0, react_1.useCallback)(function (event) {
        setSliderHeight(event.nativeEvent.layout.height);
    }, []);
    var changeVolumeOnPan = (0, react_1.useCallback)(function (event) {
        var val = NumberUtils.roundToTwoDecimalPlaces(1 - event.y / sliderHeight);
        volume.set(NumberUtils.clamp(val, 0, 1));
    }, [sliderHeight, volume]);
    var pan = react_native_gesture_handler_1.Gesture.Pan()
        .onBegin(function (event) {
        (0, react_native_reanimated_1.runOnJS)(setIsSliderBeingUsed)(true);
        changeVolumeOnPan(event);
    })
        .onChange(function (event) {
        changeVolumeOnPan(event);
    })
        .onFinalize(function () {
        (0, react_native_reanimated_1.runOnJS)(setIsSliderBeingUsed)(false);
    });
    var progressBarStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({ height: "".concat(volume.get() * 100, "%") }); });
    var updateIcon = (0, react_1.useCallback)(function (vol) {
        setVolumeIcon({ icon: getVolumeIcon(vol) });
    }, []);
    (0, react_native_reanimated_1.useDerivedValue)(function () {
        (0, react_native_reanimated_1.runOnJS)(updateVolume)(volume.get());
        (0, react_native_reanimated_1.runOnJS)(updateIcon)(volume.get());
    }, [volume]);
    return (<Hoverable_1.default>
            {function (isHovered) { return (<react_native_reanimated_1.default.View style={[isSliderBeingUsed ? styles.cursorGrabbing : styles.cursorPointer, style]}>
                    {(isSliderBeingUsed || isHovered) && (<react_native_1.View style={[styles.volumeSliderContainer]}>
                            <react_native_gesture_handler_1.GestureDetector gesture={pan}>
                                <react_native_1.View style={styles.ph2}>
                                    <react_native_1.View style={[styles.volumeSliderOverlay]} onLayout={onSliderLayout}>
                                        <react_native_1.View style={styles.volumeSliderThumb}/>
                                        <react_native_reanimated_1.default.View style={[styles.volumeSliderFill, progressBarStyle]}/>
                                    </react_native_1.View>
                                </react_native_1.View>
                            </react_native_gesture_handler_1.GestureDetector>
                        </react_native_1.View>)}

                    <IconButton_1.default tooltipText={volume.get() === 0 ? translate('videoPlayer.unmute') : translate('videoPlayer.mute')} onPress={toggleMute} src={volumeIcon.icon} small={small} shouldForceRenderingTooltipBelow/>
                </react_native_reanimated_1.default.View>); }}
        </Hoverable_1.default>);
}
VolumeButton.displayName = 'VolumeButton';
exports.default = (0, react_1.memo)(VolumeButton);
