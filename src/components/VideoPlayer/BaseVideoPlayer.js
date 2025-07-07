"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_av_1 = require("expo-av");
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var AttachmentOfflineIndicator_1 = require("@components/AttachmentOfflineIndicator");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var Hoverable_1 = require("@components/Hoverable");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var FullScreenContext_1 = require("@components/VideoPlayerContexts/FullScreenContext");
var PlaybackContext_1 = require("@components/VideoPlayerContexts/PlaybackContext");
var VideoPopoverMenuContext_1 = require("@components/VideoPlayerContexts/VideoPopoverMenuContext");
var VolumeContext_1 = require("@components/VideoPlayerContexts/VolumeContext");
var VideoPopoverMenu_1 = require("@components/VideoPopoverMenu");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var Browser_1 = require("@libs/Browser");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var CONST_1 = require("@src/CONST");
var shouldReplayVideo_1 = require("./shouldReplayVideo");
var useHandleNativeVideoControls_1 = require("./useHandleNativeVideoControls");
var VideoUtils = require("./utils");
var VideoErrorIndicator_1 = require("./VideoErrorIndicator");
var VideoPlayerControls_1 = require("./VideoPlayerControls");
function BaseVideoPlayer(_a) {
    var _b, _c;
    var url = _a.url, _d = _a.resizeMode, resizeMode = _d === void 0 ? expo_av_1.ResizeMode.CONTAIN : _d, onVideoLoaded = _a.onVideoLoaded, _e = _a.isLooping, isLooping = _e === void 0 ? false : _e, style = _a.style, videoPlayerStyle = _a.videoPlayerStyle, videoStyle = _a.videoStyle, videoControlsStyle = _a.videoControlsStyle, _f = _a.videoDuration, videoDuration = _f === void 0 ? 0 : _f, _g = _a.controlsStatus, controlsStatus = _g === void 0 ? CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW : _g, _h = _a.shouldUseSharedVideoElement, shouldUseSharedVideoElement = _h === void 0 ? false : _h, _j = _a.shouldUseSmallVideoControls, shouldUseSmallVideoControls = _j === void 0 ? false : _j, onPlaybackStatusUpdate = _a.onPlaybackStatusUpdate, onFullscreenUpdate = _a.onFullscreenUpdate, shouldPlay = _a.shouldPlay, 
    // TODO: investigate what is the root cause of the bug with unexpected video switching
    // isVideoHovered caused a bug with unexpected video switching. We are investigating the root cause of the issue,
    // but current workaround is just not to use it here for now. This causes not displaying the video controls when
    // user hovers the mouse over the carousel arrows, but this UI bug feels much less troublesome for now.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _k = _a.isVideoHovered, 
    // TODO: investigate what is the root cause of the bug with unexpected video switching
    // isVideoHovered caused a bug with unexpected video switching. We are investigating the root cause of the issue,
    // but current workaround is just not to use it here for now. This causes not displaying the video controls when
    // user hovers the mouse over the carousel arrows, but this UI bug feels much less troublesome for now.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isVideoHovered = _k === void 0 ? false : _k, isPreview = _a.isPreview, reportID = _a.reportID;
    var styles = (0, useThemeStyles_1.default)();
    var _l = (0, PlaybackContext_1.usePlaybackContext)(), pauseVideo = _l.pauseVideo, playVideo = _l.playVideo, currentlyPlayingURL = _l.currentlyPlayingURL, sharedElement = _l.sharedElement, originalParent = _l.originalParent, shareVideoPlayerElements = _l.shareVideoPlayerElements, currentVideoPlayerRef = _l.currentVideoPlayerRef, updateCurrentURLAndReportID = _l.updateCurrentURLAndReportID, videoResumeTryNumberRef = _l.videoResumeTryNumberRef, setCurrentlyPlayingURL = _l.setCurrentlyPlayingURL;
    var isFullScreenRef = (0, FullScreenContext_1.useFullScreenContext)().isFullScreenRef;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _m = (0, react_1.useState)(videoDuration * 1000), duration = _m[0], setDuration = _m[1];
    var _o = (0, react_1.useState)(0), position = _o[0], setPosition = _o[1];
    var _p = (0, react_1.useState)(false), isPlaying = _p[0], setIsPlaying = _p[1];
    var _q = (0, react_1.useState)(true), isLoading = _q[0], setIsLoading = _q[1];
    var _r = (0, react_1.useState)(false), isEnded = _r[0], setIsEnded = _r[1];
    var _s = (0, react_1.useState)(true), isBuffering = _s[0], setIsBuffering = _s[1];
    var _t = (0, react_1.useState)(false), hasError = _t[0], setHasError = _t[1];
    // we add "#t=0.001" at the end of the URL to skip first millisecond of the video and always be able to show proper video preview when video is paused at the beginning
    var sourceURL = (0, react_1.useState)(function () { return VideoUtils.addSkipTimeTagToURL(url.includes('blob:') || url.includes('file:///') ? url : (0, addEncryptedAuthTokenToURL_1.default)(url), 0.001); })[0];
    var _u = (0, react_1.useState)(false), isPopoverVisible = _u[0], setIsPopoverVisible = _u[1];
    var _v = (0, react_1.useState)({ horizontal: 0, vertical: 0 }), popoverAnchorPosition = _v[0], setPopoverAnchorPosition = _v[1];
    var _w = (0, react_1.useState)(controlsStatus), controlStatusState = _w[0], setControlStatusState = _w[1];
    var controlsOpacity = (0, react_native_reanimated_1.useSharedValue)(1);
    var controlsAnimatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        opacity: controlsOpacity.get(),
    }); });
    var videoPlayerRef = (0, react_1.useRef)(null);
    var videoPlayerElementParentRef = (0, react_1.useRef)(null);
    var videoPlayerElementRef = (0, react_1.useRef)(null);
    var sharedVideoPlayerParentRef = (0, react_1.useRef)(null);
    var isReadyForDisplayRef = (0, react_1.useRef)(false);
    var canUseTouchScreen = (0, DeviceCapabilities_1.canUseTouchScreen)();
    var isCurrentlyURLSet = currentlyPlayingURL === url;
    var isUploading = CONST_1.default.ATTACHMENT_LOCAL_URL_PREFIX.some(function (prefix) { return url.startsWith(prefix); });
    var videoStateRef = (0, react_1.useRef)(null);
    var _x = (0, VolumeContext_1.useVolumeContext)(), updateVolume = _x.updateVolume, lastNonZeroVolume = _x.lastNonZeroVolume;
    (0, useHandleNativeVideoControls_1.default)({
        videoPlayerRef: videoPlayerRef,
        isOffline: isOffline,
        isLocalFile: isUploading,
    });
    var _y = (0, VideoPopoverMenuContext_1.useVideoPopoverMenuContext)(), videoPopoverMenuPlayerRef = _y.videoPopoverMenuPlayerRef, currentPlaybackSpeed = _y.currentPlaybackSpeed, setCurrentPlaybackSpeed = _y.setCurrentPlaybackSpeed, setPopoverMenuSource = _y.setSource;
    var source = ((_c = (_b = videoPopoverMenuPlayerRef.current) === null || _b === void 0 ? void 0 : _b.props) !== null && _c !== void 0 ? _c : {}).source;
    var shouldUseNewRate = typeof source === 'number' || !source || source.uri !== sourceURL;
    var togglePlayCurrentVideo = (0, react_1.useCallback)(function () {
        setIsEnded(false);
        videoResumeTryNumberRef.current = 0;
        if (!isCurrentlyURLSet) {
            updateCurrentURLAndReportID(url, reportID);
        }
        else if (isPlaying) {
            pauseVideo();
        }
        else {
            playVideo();
        }
    }, [isCurrentlyURLSet, isPlaying, pauseVideo, playVideo, reportID, updateCurrentURLAndReportID, url, videoResumeTryNumberRef]);
    var hideControl = (0, react_1.useCallback)(function () {
        if (isEnded) {
            return;
        }
        controlsOpacity.set((0, react_native_reanimated_1.withTiming)(0, { duration: 500 }, function () { return (0, react_native_reanimated_1.runOnJS)(setControlStatusState)(CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.HIDE); }));
    }, [controlsOpacity, isEnded]);
    var debouncedHideControl = (0, react_1.useMemo)(function () { return (0, debounce_1.default)(hideControl, 1500); }, [hideControl]);
    (0, react_1.useEffect)(function () {
        if (canUseTouchScreen) {
            return;
        }
        // If the device cannot use touch screen, always set the control status as 'show'.
        // Then if user hover over the video, controls is shown.
        setControlStatusState(CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
    }, [canUseTouchScreen]);
    (0, react_1.useEffect)(function () {
        // We only auto hide the control if the device can use touch screen.
        if (!canUseTouchScreen) {
            return;
        }
        if (controlStatusState !== CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW) {
            return;
        }
        if (!isPlaying || isPopoverVisible) {
            debouncedHideControl.cancel();
            return;
        }
        debouncedHideControl();
    }, [isPlaying, debouncedHideControl, controlStatusState, isPopoverVisible, canUseTouchScreen]);
    var stopWheelPropagation = (0, react_1.useCallback)(function (ev) { return ev.stopPropagation(); }, []);
    var toggleControl = (0, react_1.useCallback)(function () {
        if (controlStatusState === CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW) {
            hideControl();
            return;
        }
        setControlStatusState(CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
        controlsOpacity.set(1);
    }, [controlStatusState, controlsOpacity, hideControl]);
    var showPopoverMenu = function (event) {
        var _a;
        videoPopoverMenuPlayerRef.current = videoPlayerRef.current;
        (_a = videoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.getStatusAsync().then(function (status) {
            if (!('rate' in status && status.rate)) {
                return;
            }
            if (shouldUseNewRate) {
                setCurrentPlaybackSpeed(status.rate);
            }
            setIsPopoverVisible(true);
        });
        setPopoverMenuSource(url);
        if (!event || !('nativeEvent' in event)) {
            return;
        }
        setPopoverAnchorPosition({ horizontal: event.nativeEvent.pageX, vertical: event.nativeEvent.pageY });
    };
    var hidePopoverMenu = function () {
        setIsPopoverVisible(false);
    };
    // fix for iOS mWeb: preventing iOS native player default behavior from pausing the video when exiting fullscreen
    var preventPausingWhenExitingFullscreen = (0, react_1.useCallback)(function (isVideoPlaying) {
        if (videoResumeTryNumberRef.current === 0 || isVideoPlaying) {
            return;
        }
        if (videoResumeTryNumberRef.current === 1) {
            playVideo();
        }
        // eslint-disable-next-line react-compiler/react-compiler
        videoResumeTryNumberRef.current -= 1;
    }, [playVideo, videoResumeTryNumberRef]);
    var prevIsMuted = (0, react_native_reanimated_1.useSharedValue)(true);
    var prevVolume = (0, react_native_reanimated_1.useSharedValue)(0);
    var handlePlaybackStatusUpdate = (0, react_1.useCallback)(function (status) {
        var _a, _b;
        if (!status.isLoaded) {
            preventPausingWhenExitingFullscreen(false);
            setIsPlaying(false);
            setIsLoading(true); // when video is ready to display duration is not NaN
            setIsBuffering(false);
            setDuration(videoDuration * 1000);
            setPosition(0);
            onPlaybackStatusUpdate === null || onPlaybackStatusUpdate === void 0 ? void 0 : onPlaybackStatusUpdate(status);
            return;
        }
        if (status.didJustFinish) {
            setIsEnded(status.didJustFinish && !status.isLooping);
            setControlStatusState(CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
            controlsOpacity.set(1);
        }
        else if (status.isPlaying && isEnded) {
            setIsEnded(false);
        }
        // These two conditions are essential for the mute and unmute functionality to work properly during
        // fullscreen playback on the web
        if (prevIsMuted.get() && prevVolume.get() === 0 && !status.isMuted && status.volume === 0) {
            updateVolume(lastNonZeroVolume.get());
        }
        if (isFullScreenRef.current && prevVolume.get() !== 0 && status.volume === 0 && !status.isMuted) {
            (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync({ isMuted: true });
        }
        prevIsMuted.set(status.isMuted);
        prevVolume.set(status.volume);
        var isVideoPlaying = status.isPlaying;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var currentDuration = status.durationMillis || videoDuration * 1000;
        var currentPosition = status.positionMillis || 0;
        if ((0, shouldReplayVideo_1.default)(status, isVideoPlaying, currentDuration, currentPosition) && !isEnded) {
            (_b = videoPlayerRef.current) === null || _b === void 0 ? void 0 : _b.setStatusAsync({ positionMillis: 0, shouldPlay: true });
        }
        preventPausingWhenExitingFullscreen(isVideoPlaying);
        setIsPlaying(isVideoPlaying);
        setIsLoading(Number.isNaN(status.durationMillis)); // when video is ready to display duration is not NaN
        setIsBuffering(status.isBuffering);
        setDuration(currentDuration);
        setPosition(currentPosition);
        videoStateRef.current = status;
        onPlaybackStatusUpdate === null || onPlaybackStatusUpdate === void 0 ? void 0 : onPlaybackStatusUpdate(status);
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to trigger this when isPlaying changes because isPlaying is only used inside shouldReplayVideo
    [onPlaybackStatusUpdate, preventPausingWhenExitingFullscreen, videoDuration, isEnded]);
    var handleFullscreenUpdate = (0, react_1.useCallback)(function (event) {
        var _a, _b;
        onFullscreenUpdate === null || onFullscreenUpdate === void 0 ? void 0 : onFullscreenUpdate(event);
        if (event.fullscreenUpdate === expo_av_1.VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
            // When the video is in fullscreen, we don't want the scroll to be captured by the InvertedFlatList of report screen.
            // This will also allow the user to scroll the video playback speed.
            if (videoPlayerElementParentRef.current && 'addEventListener' in videoPlayerElementParentRef.current) {
                videoPlayerElementParentRef.current.addEventListener('wheel', stopWheelPropagation);
            }
        }
        if (event.fullscreenUpdate === expo_av_1.VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
            if (videoPlayerElementParentRef.current && 'removeEventListener' in videoPlayerElementParentRef.current) {
                videoPlayerElementParentRef.current.removeEventListener('wheel', stopWheelPropagation);
            }
            isFullScreenRef.current = false;
            // Sync volume updates in full screen mode after leaving it
            (_b = (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.getStatusAsync) === null || _b === void 0 ? void 0 : _b.call(_a).then(function (status) {
                if (!('isMuted' in status)) {
                    return;
                }
                updateVolume(status.isMuted ? 0 : status.volume || 1);
            });
            // we need to use video state ref to check if video is playing, to catch proper state after exiting fullscreen
            // and also fix a bug with fullscreen mode dismissing when handleFullscreenUpdate function changes
            if (videoStateRef.current && (!('isPlaying' in videoStateRef.current) || videoStateRef.current.isPlaying)) {
                pauseVideo();
                playVideo();
                videoResumeTryNumberRef.current = 3;
            }
        }
    }, [isFullScreenRef, onFullscreenUpdate, pauseVideo, playVideo, videoResumeTryNumberRef, updateVolume, currentVideoPlayerRef, stopWheelPropagation]);
    var bindFunctions = (0, react_1.useCallback)(function () {
        var currentVideoPlayer = currentVideoPlayerRef.current;
        if (!currentVideoPlayer) {
            return;
        }
        currentVideoPlayer._onPlaybackStatusUpdate = handlePlaybackStatusUpdate;
        currentVideoPlayer._onFullscreenUpdate = handleFullscreenUpdate;
        // update states after binding
        currentVideoPlayer.getStatusAsync().then(function (status) {
            handlePlaybackStatusUpdate(status);
        });
    }, [currentVideoPlayerRef, handleFullscreenUpdate, handlePlaybackStatusUpdate]);
    // use `useLayoutEffect` instead of `useEffect` because ref is null when unmount in `useEffect` hook
    // ref url: https://reactjs.org/blog/2020/08/10/react-v17-rc.html#effect-cleanup-timing
    (0, react_1.useLayoutEffect)(function () { return function () {
        var _a, _b;
        if (shouldUseSharedVideoElement || videoPlayerRef.current !== currentVideoPlayerRef.current) {
            return;
        }
        (_b = (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync) === null || _b === void 0 ? void 0 : _b.call(_a, { shouldPlay: false, positionMillis: 0 }).then(function () {
            currentVideoPlayerRef.current = null;
        });
    }; }, [currentVideoPlayerRef, shouldUseSharedVideoElement]);
    (0, react_1.useEffect)(function () {
        if (!isUploading || !videoPlayerRef.current) {
            return;
        }
        // If we are uploading a new video, we want to pause previous playing video and immediately set the video player ref.
        if (currentVideoPlayerRef.current) {
            pauseVideo();
        }
        currentVideoPlayerRef.current = videoPlayerRef.current;
    }, [url, currentVideoPlayerRef, isUploading, pauseVideo]);
    var isCurrentlyURLSetRef = (0, react_1.useRef)(undefined);
    isCurrentlyURLSetRef.current = isCurrentlyURLSet;
    (0, react_1.useEffect)(function () { return function () {
        if (shouldUseSharedVideoElement || !isCurrentlyURLSetRef.current) {
            return;
        }
        setCurrentlyPlayingURL(null);
    }; }, [setCurrentlyPlayingURL, shouldUseSharedVideoElement]);
    // update shared video elements
    (0, react_1.useEffect)(function () {
        // On mobile safari, we need to auto-play when sharing video element here
        shareVideoPlayerElements(videoPlayerRef.current, videoPlayerElementParentRef.current, videoPlayerElementRef.current, isUploading || isFullScreenRef.current || (!isReadyForDisplayRef.current && !(0, Browser_1.isMobileSafari)()), { shouldUseSharedVideoElement: shouldUseSharedVideoElement, url: url, reportID: reportID });
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, shareVideoPlayerElements, url, isUploading, isFullScreenRef, reportID]);
    // Call bindFunctions() through the refs to avoid adding it to the dependency array of the DOM mutation effect, as doing so would change the DOM when the functions update.
    var bindFunctionsRef = (0, react_1.useRef)(null);
    var shouldBindFunctionsRef = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        bindFunctionsRef.current = bindFunctions;
        if (shouldBindFunctionsRef.current) {
            bindFunctions();
        }
    }, [bindFunctions]);
    // append shared video element to new parent (used for example in attachment modal)
    (0, react_1.useEffect)(function () {
        var _a, _b;
        shouldBindFunctionsRef.current = false;
        if (url !== currentlyPlayingURL || !sharedElement || isFullScreenRef.current) {
            return;
        }
        var newParentRef = sharedVideoPlayerParentRef.current;
        if (!shouldUseSharedVideoElement) {
            if (newParentRef && 'childNodes' in newParentRef && newParentRef.childNodes[0]) {
                (_a = newParentRef.childNodes[0]) === null || _a === void 0 ? void 0 : _a.remove();
            }
            return;
        }
        videoPlayerRef.current = currentVideoPlayerRef.current;
        if (currentlyPlayingURL === url && newParentRef && 'appendChild' in newParentRef) {
            newParentRef.appendChild(sharedElement);
            (_b = bindFunctionsRef.current) === null || _b === void 0 ? void 0 : _b.call(bindFunctionsRef);
            shouldBindFunctionsRef.current = true;
        }
        return function () {
            var _a;
            if (!originalParent || !('appendChild' in originalParent)) {
                return;
            }
            originalParent.appendChild(sharedElement);
            if (!newParentRef || !('childNodes' in newParentRef)) {
                return;
            }
            (_a = newParentRef.childNodes[0]) === null || _a === void 0 ? void 0 : _a.remove();
        };
    }, [currentVideoPlayerRef, currentlyPlayingURL, isFullScreenRef, originalParent, reportID, sharedElement, shouldUseSharedVideoElement, url]);
    (0, react_1.useEffect)(function () {
        if (!shouldPlay) {
            return;
        }
        updateCurrentURLAndReportID(url, reportID);
    }, [reportID, shouldPlay, updateCurrentURLAndReportID, url]);
    (0, react_1.useEffect)(function () {
        var _a;
        (_a = videoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync({ isMuted: true });
    }, []);
    return (<>
            {/* We need to wrap the video component in a component that will catch unhandled pointer events. Otherwise, these
        events will bubble up the tree, and it will cause unexpected press behavior. */}
            <PressableWithoutFeedback_1.default accessible={false} style={[styles.cursorDefault, style]}>
                <Hoverable_1.default shouldFreezeCapture={isPopoverVisible}>
                    {function (isHovered) { return (<react_native_1.View style={[styles.w100, styles.h100]}>
                            <PressableWithoutFeedback_1.default accessibilityRole="button" accessible={false} onPress={function () {
                if (isFullScreenRef.current) {
                    return;
                }
                if (!canUseTouchScreen) {
                    togglePlayCurrentVideo();
                    return;
                }
                toggleControl();
            }} style={[styles.flex1, styles.noSelect]}>
                                {shouldUseSharedVideoElement ? (<>
                                        <react_native_1.View ref={sharedVideoPlayerParentRef} style={[styles.flex1]}/>
                                        {/* We are adding transparent absolute View between appended video component and control buttons to enable
            catching onMouse events from Attachment Carousel. Due to late appending React doesn't handle
            element's events properly. */}
                                        <react_native_1.View style={[styles.w100, styles.h100, styles.pAbsolute]}/>
                                    </>) : (<react_native_1.View fsClass="fs-exclude" style={styles.flex1} ref={function (el) {
                    if (!el) {
                        return;
                    }
                    var elHTML = el;
                    if ('childNodes' in elHTML && elHTML.childNodes[0]) {
                        videoPlayerElementRef.current = elHTML.childNodes[0];
                    }
                    videoPlayerElementParentRef.current = el;
                }}>
                                        <expo_av_1.Video ref={videoPlayerRef} style={[styles.w100, styles.h100, videoPlayerStyle]} videoStyle={[styles.w100, styles.h100, videoStyle]} source={{
                    // if video is loading and is offline, we want to change uri to "" to
                    // reset the video player after connection is back
                    uri: !isLoading || (isLoading && !isOffline) ? sourceURL : '',
                }} shouldPlay={shouldPlay} useNativeControls={false} resizeMode={resizeMode} isLooping={isLooping} onReadyForDisplay={function (e) {
                    var _a, _b;
                    isReadyForDisplayRef.current = true;
                    onVideoLoaded === null || onVideoLoaded === void 0 ? void 0 : onVideoLoaded(e);
                    if (shouldUseNewRate) {
                        return;
                    }
                    (_b = (_a = videoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync) === null || _b === void 0 ? void 0 : _b.call(_a, { rate: currentPlaybackSpeed });
                }} onLoad={function () {
                    if (hasError) {
                        setHasError(false);
                    }
                    if (!isCurrentlyURLSet || isUploading) {
                        return;
                    }
                    playVideo();
                }} onPlaybackStatusUpdate={handlePlaybackStatusUpdate} onFullscreenUpdate={handleFullscreenUpdate} onError={function () {
                    // No need to set hasError while offline, since the offline indicator is already shown.
                    // Once the user reconnects, if the video is unsupported, the error will be triggered again.
                    if (isOffline) {
                        return;
                    }
                    setHasError(true);
                }} testID={CONST_1.default.VIDEO_PLAYER_TEST_ID}/>
                                    </react_native_1.View>)}
                            </PressableWithoutFeedback_1.default>
                            {hasError && !isBuffering && !isOffline && <VideoErrorIndicator_1.default isPreview={isPreview}/>}
                            {((isLoading && !isOffline && !hasError) || (isBuffering && !isPlaying && !hasError)) && (<FullscreenLoadingIndicator_1.default style={[styles.opacity1, styles.bgTransparent]}/>)}
                            {isLoading && (isOffline || !isBuffering) && <AttachmentOfflineIndicator_1.default isPreview={isPreview}/>}
                            {controlStatusState !== CONST_1.default.VIDEO_PLAYER.CONTROLS_STATUS.HIDE && !isLoading && (isPopoverVisible || isHovered || canUseTouchScreen || isEnded) && (<VideoPlayerControls_1.default duration={duration} position={position} url={url} videoPlayerRef={videoPlayerRef} isPlaying={isPlaying} small={shouldUseSmallVideoControls} style={[videoControlsStyle, controlsAnimatedStyle]} togglePlayCurrentVideo={togglePlayCurrentVideo} controlsStatus={controlStatusState} showPopoverMenu={showPopoverMenu} reportID={reportID}/>)}
                        </react_native_1.View>); }}
                </Hoverable_1.default>
            </PressableWithoutFeedback_1.default>
            <VideoPopoverMenu_1.default isPopoverVisible={isPopoverVisible} hidePopover={hidePopoverMenu} anchorPosition={popoverAnchorPosition}/>
        </>);
}
BaseVideoPlayer.displayName = 'BaseVideoPlayer';
exports.default = BaseVideoPlayer;
