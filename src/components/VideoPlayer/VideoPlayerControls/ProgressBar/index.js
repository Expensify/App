"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var PlaybackContext_1 = require("@components/VideoPlayerContexts/PlaybackContext");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function getProgress(currentPosition, maxPosition) {
    return Math.min(Math.max((currentPosition / maxPosition) * 100, 0), 100);
}
function ProgressBar(_a) {
    var duration = _a.duration, position = _a.position, seekPosition = _a.seekPosition;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, PlaybackContext_1.usePlaybackContext)(), pauseVideo = _b.pauseVideo, playVideo = _b.playVideo, checkIfVideoIsPlaying = _b.checkIfVideoIsPlaying;
    var _c = (0, react_1.useState)(1), sliderWidth = _c[0], setSliderWidth = _c[1];
    var _d = (0, react_1.useState)(false), isSliderPressed = _d[0], setIsSliderPressed = _d[1];
    var progressWidth = (0, react_native_reanimated_1.useSharedValue)(0);
    var wasVideoPlayingOnCheck = (0, react_native_reanimated_1.useSharedValue)(false);
    var onCheckIfVideoIsPlaying = function (isPlaying) {
        wasVideoPlayingOnCheck.set(isPlaying);
    };
    var progressBarInteraction = function (event) {
        var progress = getProgress(event.x, sliderWidth);
        progressWidth.set(progress);
        (0, react_native_reanimated_1.runOnJS)(seekPosition)((progress * duration) / 100);
    };
    var onSliderLayout = function (event) {
        setSliderWidth(event.nativeEvent.layout.width);
    };
    var pan = react_native_gesture_handler_1.Gesture.Pan()
        .runOnJS(true)
        .onBegin(function (event) {
        setIsSliderPressed(true);
        checkIfVideoIsPlaying(onCheckIfVideoIsPlaying);
        pauseVideo();
        progressBarInteraction(event);
    })
        .onChange(function (event) {
        progressBarInteraction(event);
    })
        .onFinalize(function () {
        setIsSliderPressed(false);
        if (!wasVideoPlayingOnCheck.get()) {
            return;
        }
        playVideo();
    });
    (0, react_1.useEffect)(function () {
        if (isSliderPressed) {
            return;
        }
        progressWidth.set(getProgress(position, duration));
    }, [duration, isSliderPressed, position, progressWidth]);
    var progressBarStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({ width: "".concat(progressWidth.get(), "%") }); });
    return (<react_native_gesture_handler_1.GestureDetector gesture={pan}>
            <react_native_reanimated_1.default.View style={[styles.w100, styles.h100, styles.pv2, styles.cursorPointer, styles.flex1, styles.justifyContentCenter]}>
                <react_native_reanimated_1.default.View style={styles.progressBarOutline} onLayout={onSliderLayout}>
                    <react_native_reanimated_1.default.View style={styles.progressBarFill} animatedProps={progressBarStyle}/>
                </react_native_reanimated_1.default.View>
            </react_native_reanimated_1.default.View>
        </react_native_gesture_handler_1.GestureDetector>);
}
ProgressBar.displayName = 'ProgressBar';
exports.default = ProgressBar;
