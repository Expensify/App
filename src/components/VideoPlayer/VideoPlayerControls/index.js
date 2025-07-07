"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var IconButton_1 = require("@components/VideoPlayer/IconButton");
var utils_1 = require("@components/VideoPlayer/utils");
var FullScreenContext_1 = require("@components/VideoPlayerContexts/FullScreenContext");
var PlaybackContext_1 = require("@components/VideoPlayerContexts/PlaybackContext");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var ProgressBar_1 = require("./ProgressBar");
var VolumeButton_1 = require("./VolumeButton");
function VideoPlayerControls(_a) {
    var duration = _a.duration, position = _a.position, url = _a.url, videoPlayerRef = _a.videoPlayerRef, isPlaying = _a.isPlaying, _b = _a.small, small = _b === void 0 ? false : _b, style = _a.style, showPopoverMenu = _a.showPopoverMenu, togglePlayCurrentVideo = _a.togglePlayCurrentVideo, _c = _a.controlsStatus, controlsStatus = _c === void 0 ? CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW : _c, reportID = _a.reportID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var updateCurrentURLAndReportID = (0, PlaybackContext_1.usePlaybackContext)().updateCurrentURLAndReportID;
    var isFullScreenRef = (0, FullScreenContext_1.useFullScreenContext)().isFullScreenRef;
    var _d = (0, react_1.useState)(false), shouldShowTime = _d[0], setShouldShowTime = _d[1];
    var iconSpacing = small ? styles.mr3 : styles.mr4;
    var onLayout = function (event) {
        setShouldShowTime(event.nativeEvent.layout.width > CONST_1.default.VIDEO_PLAYER.HIDE_TIME_TEXT_WIDTH);
    };
    var enterFullScreenMode = (0, react_1.useCallback)(function () {
        var _a;
        // eslint-disable-next-line react-compiler/react-compiler
        isFullScreenRef.current = true;
        updateCurrentURLAndReportID(url, reportID);
        (_a = videoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.presentFullscreenPlayer();
    }, [isFullScreenRef, reportID, updateCurrentURLAndReportID, url, videoPlayerRef]);
    var seekPosition = (0, react_1.useCallback)(function (newPosition) {
        var _a;
        (_a = videoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync({ positionMillis: newPosition });
    }, [videoPlayerRef]);
    var durationFormatted = (0, react_1.useMemo)(function () { return (0, utils_1.convertMillisecondsToTime)(duration); }, [duration]);
    return (<react_native_reanimated_1.default.View style={[
            styles.videoPlayerControlsContainer,
            small ? [styles.p2, styles.pb0] : [styles.p3, styles.pb1],
            controlsStatus === CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.VOLUME_ONLY && [styles.pt2, styles.pb2],
            style,
        ]} onLayout={onLayout}>
            {controlsStatus === CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW && (<react_native_1.View style={[styles.videoPlayerControlsButtonContainer, !small && styles.mb4]}>
                    <react_native_1.View style={[styles.videoPlayerControlsRow]}>
                        <IconButton_1.default src={isPlaying ? Expensicons.Pause : Expensicons.Play} tooltipText={isPlaying ? translate('videoPlayer.pause') : translate('videoPlayer.play')} onPress={togglePlayCurrentVideo} style={styles.mr2} small={small}/>
                        {shouldShowTime && (<react_native_1.View style={[styles.videoPlayerControlsRow]}>
                                <Text_1.default style={[styles.videoPlayerText, styles.videoPlayerTimeComponentWidth]}>{(0, utils_1.convertMillisecondsToTime)(position)}</Text_1.default>
                                <Text_1.default style={[styles.videoPlayerText]}>/</Text_1.default>
                                <Text_1.default style={[styles.videoPlayerText, styles.videoPlayerTimeComponentWidth]}>{durationFormatted}</Text_1.default>
                            </react_native_1.View>)}
                    </react_native_1.View>
                    <react_native_1.View style={[styles.videoPlayerControlsRow]}>
                        <VolumeButton_1.default style={iconSpacing}/>
                        <IconButton_1.default src={Expensicons.Fullscreen} tooltipText={translate('videoPlayer.fullscreen')} onPress={enterFullScreenMode} style={iconSpacing} small={small}/>
                        <IconButton_1.default src={Expensicons.ThreeDots} tooltipText={translate('common.more')} onPress={showPopoverMenu} small={small}/>
                    </react_native_1.View>
                </react_native_1.View>)}
            <react_native_1.View style={styles.videoPlayerControlsRow}>
                <react_native_1.View style={[styles.flex1]}>
                    <ProgressBar_1.default duration={duration} position={position} seekPosition={seekPosition}/>
                </react_native_1.View>
                {controlsStatus === CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.VOLUME_ONLY && <VolumeButton_1.default style={styles.ml3}/>}
            </react_native_1.View>
        </react_native_reanimated_1.default.View>);
}
VideoPlayerControls.displayName = 'VideoPlayerControls';
exports.default = VideoPlayerControls;
