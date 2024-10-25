/* eslint-disable no-underscore-dangle */
import type {AVPlaybackStatus, VideoFullscreenUpdateEvent} from 'expo-av';
import {ResizeMode, Video, VideoFullscreenUpdate} from 'expo-av';
import debounce from 'lodash/debounce';
import type {MutableRefObject} from 'react';
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import AttachmentOfflineIndicator from '@components/AttachmentOfflineIndicator';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Hoverable from '@components/Hoverable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {useFullScreenContext} from '@components/VideoPlayerContexts/FullScreenContext';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import type {PlaybackSpeed} from '@components/VideoPlayerContexts/types';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import {useVolumeContext} from '@components/VideoPlayerContexts/VolumeContext';
import VideoPopoverMenu from '@components/VideoPopoverMenu';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import shouldReplayVideo from './shouldReplayVideo';
import type {VideoPlayerProps, VideoWithOnFullScreenUpdate} from './types';
import * as VideoUtils from './utils';
import VideoPlayerControls from './VideoPlayerControls';

function BaseVideoPlayer({
    url,
    resizeMode = ResizeMode.CONTAIN,
    onVideoLoaded,
    isLooping = false,
    style,
    videoPlayerStyle,
    videoStyle,
    videoControlsStyle,
    videoDuration = 0,
    controlsStatus = CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW,
    shouldUseSharedVideoElement = false,
    shouldUseSmallVideoControls = false,
    onPlaybackStatusUpdate,
    onFullscreenUpdate,
    shouldPlay,
    // TODO: investigate what is the root cause of the bug with unexpected video switching
    // isVideoHovered caused a bug with unexpected video switching. We are investigating the root cause of the issue,
    // but current workaround is just not to use it here for now. This causes not displaying the video controls when
    // user hovers the mouse over the carousel arrows, but this UI bug feels much less troublesome for now.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isVideoHovered = false,
    isPreview,
}: VideoPlayerProps) {
    const styles = useThemeStyles();
    const {
        pauseVideo,
        playVideo,
        currentlyPlayingURL,
        sharedElement,
        originalParent,
        shareVideoPlayerElements,
        currentVideoPlayerRef,
        updateCurrentlyPlayingURL,
        videoResumeTryNumberRef,
        setCurrentlyPlayingURL,
    } = usePlaybackContext();
    const {isFullScreenRef} = useFullScreenContext();
    const {isOffline} = useNetwork();
    const [duration, setDuration] = useState(videoDuration * 1000);
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(true);
    // we add "#t=0.001" at the end of the URL to skip first milisecond of the video and always be able to show proper video preview when video is paused at the beginning
    const [sourceURL] = useState(VideoUtils.addSkipTimeTagToURL(url.includes('blob:') || url.includes('file:///') ? url : addEncryptedAuthTokenToURL(url), 0.001));
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState({horizontal: 0, vertical: 0});
    const [controlStatusState, setControlStatusState] = useState(controlsStatus);
    const controlsOpacity = useSharedValue(1);
    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.value,
    }));

    const videoPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);
    const videoPlayerElementParentRef = useRef<View | HTMLDivElement | null>(null);
    const videoPlayerElementRef = useRef<View | HTMLDivElement | null>(null);
    const sharedVideoPlayerParentRef = useRef<View | HTMLDivElement | null>(null);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const isCurrentlyURLSet = currentlyPlayingURL === url;
    const isUploading = CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => url.startsWith(prefix));
    const videoStateRef = useRef<AVPlaybackStatus | null>(null);
    const {updateVolume} = useVolumeContext();
    const {videoPopoverMenuPlayerRef, currentPlaybackSpeed, setCurrentPlaybackSpeed} = useVideoPopoverMenuContext();
    const {source} = videoPopoverMenuPlayerRef.current?.props ?? {};
    const shouldUseNewRate = typeof source === 'number' || !source || source.uri !== sourceURL;

    const togglePlayCurrentVideo = useCallback(() => {
        videoResumeTryNumberRef.current = 0;
        if (!isCurrentlyURLSet) {
            updateCurrentlyPlayingURL(url);
        } else if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    }, [isCurrentlyURLSet, isPlaying, pauseVideo, playVideo, updateCurrentlyPlayingURL, url, videoResumeTryNumberRef]);

    const hideControl = useCallback(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        controlsOpacity.value = withTiming(0, {duration: 500}, () => runOnJS(setControlStatusState)(CONST.VIDEO_PLAYER.CONTROLS_STATUS.HIDE));
    }, [controlsOpacity]);
    const debouncedHideControl = useMemo(() => debounce(hideControl, 1500), [hideControl]);

    useEffect(() => {
        if (canUseTouchScreen) {
            return;
        }
        // If the device cannot use touch screen, always set the control status as 'show'.
        // Then if user hover over the video, controls is shown.
        setControlStatusState(CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
    }, [canUseTouchScreen]);

    useEffect(() => {
        // We only auto hide the control if the device can use touch screen.
        if (!canUseTouchScreen) {
            return;
        }
        if (controlStatusState !== CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW) {
            return;
        }
        if (!isPlaying || isPopoverVisible) {
            debouncedHideControl.cancel();
            return;
        }

        debouncedHideControl();
    }, [isPlaying, debouncedHideControl, controlStatusState, isPopoverVisible, canUseTouchScreen]);

    const stopWheelPropagation = useCallback((ev: WheelEvent) => ev.stopPropagation(), []);

    const toggleControl = useCallback(() => {
        if (controlStatusState === CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW) {
            hideControl();
            return;
        }
        setControlStatusState(CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
        controlsOpacity.value = 1;
    }, [controlStatusState, controlsOpacity, hideControl]);

    const showPopoverMenu = (event?: GestureResponderEvent | KeyboardEvent) => {
        videoPopoverMenuPlayerRef.current = videoPlayerRef.current;
        videoPlayerRef.current?.getStatusAsync().then((status) => {
            if (!('rate' in status && status.rate)) {
                return;
            }
            if (shouldUseNewRate) {
                setCurrentPlaybackSpeed(status.rate as PlaybackSpeed);
            }
            setIsPopoverVisible(true);
        });
        if (!event || !('nativeEvent' in event)) {
            return;
        }
        setPopoverAnchorPosition({horizontal: event.nativeEvent.pageX, vertical: event.nativeEvent.pageY});
    };

    const hidePopoverMenu = () => {
        setIsPopoverVisible(false);
    };

    // fix for iOS mWeb: preventing iOS native player default behavior from pausing the video when exiting fullscreen
    const preventPausingWhenExitingFullscreen = useCallback(
        (isVideoPlaying: boolean) => {
            if (videoResumeTryNumberRef.current === 0 || isVideoPlaying) {
                return;
            }
            if (videoResumeTryNumberRef.current === 1) {
                playVideo();
            }
            // eslint-disable-next-line react-compiler/react-compiler
            videoResumeTryNumberRef.current -= 1;
        },
        [playVideo, videoResumeTryNumberRef],
    );

    const prevIsMutedRef = useRef(false);
    const prevVolumeRef = useRef(0);

    const handlePlaybackStatusUpdate = useCallback(
        (status: AVPlaybackStatus) => {
            if (!status.isLoaded) {
                preventPausingWhenExitingFullscreen(false);
                setIsPlaying(false);
                setIsLoading(true); // when video is ready to display duration is not NaN
                setIsBuffering(false);
                setDuration(videoDuration * 1000);
                setPosition(0);
                onPlaybackStatusUpdate?.(status);
                return;
            }

            if (prevIsMutedRef.current && prevVolumeRef.current === 0 && !status.isMuted) {
                updateVolume(0.25);
            }
            if (isFullScreenRef.current && prevVolumeRef.current !== 0 && status.volume === 0 && !status.isMuted) {
                currentVideoPlayerRef.current?.setStatusAsync({isMuted: true});
            }
            prevIsMutedRef.current = status.isMuted;
            prevVolumeRef.current = status.volume;

            const isVideoPlaying = status.isPlaying;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const currentDuration = status.durationMillis || videoDuration * 1000;
            const currentPositon = status.positionMillis || 0;

            if (shouldReplayVideo(status, isVideoPlaying, currentDuration, currentPositon)) {
                videoPlayerRef.current?.setStatusAsync({positionMillis: 0, shouldPlay: true});
            }

            preventPausingWhenExitingFullscreen(isVideoPlaying);
            setIsPlaying(isVideoPlaying);
            setIsLoading(Number.isNaN(status.durationMillis)); // when video is ready to display duration is not NaN
            setIsBuffering(status.isBuffering);
            setDuration(currentDuration);
            setPosition(currentPositon);

            videoStateRef.current = status;
            onPlaybackStatusUpdate?.(status);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to trigger this when isPlaying changes because isPlaying is only used inside shouldReplayVideo
        [onPlaybackStatusUpdate, preventPausingWhenExitingFullscreen, videoDuration],
    );

    const handleFullscreenUpdate = useCallback(
        (event: VideoFullscreenUpdateEvent) => {
            onFullscreenUpdate?.(event);

            if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
                // When the video is in fullscreen, we don't want the scroll to be captured by the InvertedFlatList of report screen.
                // This will also allow the user to scroll the video playback speed.
                if (videoPlayerElementParentRef.current && 'addEventListener' in videoPlayerElementParentRef.current) {
                    videoPlayerElementParentRef.current.addEventListener('wheel', stopWheelPropagation);
                }
            }

            if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
                if (videoPlayerElementParentRef.current && 'removeEventListener' in videoPlayerElementParentRef.current) {
                    videoPlayerElementParentRef.current.removeEventListener('wheel', stopWheelPropagation);
                }
                isFullScreenRef.current = false;

                // Sync volume updates in full screen mode after leaving it
                currentVideoPlayerRef.current?.getStatusAsync?.().then((status) => {
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
        },
        [isFullScreenRef, onFullscreenUpdate, pauseVideo, playVideo, videoResumeTryNumberRef, updateVolume, currentVideoPlayerRef, stopWheelPropagation],
    );

    const bindFunctions = useCallback(() => {
        const currentVideoPlayer = currentVideoPlayerRef.current;
        if (!currentVideoPlayer) {
            return;
        }
        currentVideoPlayer._onPlaybackStatusUpdate = handlePlaybackStatusUpdate;
        currentVideoPlayer._onFullscreenUpdate = handleFullscreenUpdate;

        // update states after binding
        currentVideoPlayer.getStatusAsync().then((status) => {
            handlePlaybackStatusUpdate(status);
        });
    }, [currentVideoPlayerRef, handleFullscreenUpdate, handlePlaybackStatusUpdate]);

    // use `useLayoutEffect` instead of `useEffect` because ref is null when unmount in `useEffect` hook
    // ref url: https://reactjs.org/blog/2020/08/10/react-v17-rc.html#effect-cleanup-timing
    useLayoutEffect(
        () => () => {
            if (shouldUseSharedVideoElement || videoPlayerRef.current !== currentVideoPlayerRef.current) {
                return;
            }
            currentVideoPlayerRef.current = null;
        },
        [currentVideoPlayerRef, shouldUseSharedVideoElement],
    );

    useEffect(() => {
        if (!isUploading || !videoPlayerRef.current) {
            return;
        }

        // If we are uploading a new video, we want to pause previous playing video and immediately set the video player ref.
        if (currentVideoPlayerRef.current) {
            pauseVideo();
        }
        currentVideoPlayerRef.current = videoPlayerRef.current;
    }, [url, currentVideoPlayerRef, isUploading, pauseVideo]);

    const isCurrentlyURLSetRef = useRef<boolean>();
    isCurrentlyURLSetRef.current = isCurrentlyURLSet;

    useEffect(
        () => () => {
            if (shouldUseSharedVideoElement || !isCurrentlyURLSetRef.current) {
                return;
            }

            setCurrentlyPlayingURL(null);
        },
        [setCurrentlyPlayingURL, shouldUseSharedVideoElement],
    );
    // update shared video elements
    useEffect(() => {
        if (shouldUseSharedVideoElement || url !== currentlyPlayingURL) {
            return;
        }
        shareVideoPlayerElements(videoPlayerRef.current, videoPlayerElementParentRef.current, videoPlayerElementRef.current, isUploading || isFullScreenRef.current);
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, shareVideoPlayerElements, url, isUploading, isFullScreenRef]);

    // append shared video element to new parent (used for example in attachment modal)
    useEffect(() => {
        if (url !== currentlyPlayingURL || !sharedElement || isFullScreenRef.current) {
            return;
        }

        const newParentRef = sharedVideoPlayerParentRef.current;

        if (!shouldUseSharedVideoElement) {
            if (newParentRef && 'childNodes' in newParentRef && newParentRef.childNodes[0]) {
                newParentRef.childNodes[0]?.remove();
            }
            return;
        }

        videoPlayerRef.current = currentVideoPlayerRef.current;
        if (currentlyPlayingURL === url && newParentRef && 'appendChild' in newParentRef) {
            newParentRef.appendChild(sharedElement as HTMLDivElement);
            bindFunctions();
        }
        return () => {
            if (!originalParent || !('appendChild' in originalParent)) {
                return;
            }
            originalParent.appendChild(sharedElement as HTMLDivElement);

            if (!newParentRef || !('childNodes' in newParentRef)) {
                return;
            }
            newParentRef.childNodes[0]?.remove();
        };
    }, [bindFunctions, currentVideoPlayerRef, currentlyPlayingURL, isFullScreenRef, originalParent, sharedElement, shouldUseSharedVideoElement, url]);

    useEffect(() => {
        if (!shouldPlay) {
            return;
        }
        updateCurrentlyPlayingURL(url);
    }, [shouldPlay, updateCurrentlyPlayingURL, url]);

    useEffect(() => {
        videoPlayerRef.current?.setStatusAsync({volume: 0});
    }, []);

    return (
        <>
            {/* We need to wrap the video component in a component that will catch unhandled pointer events. Otherwise, these
            events will bubble up the tree, and it will cause unexpected press behavior. */}
            <PressableWithoutFeedback
                accessible={false}
                style={[styles.cursorDefault, style]}
            >
                <Hoverable shouldFreezeCapture={isPopoverVisible}>
                    {(isHovered) => (
                        <View style={[styles.w100, styles.h100]}>
                            <PressableWithoutFeedback
                                accessibilityRole="button"
                                accessible={false}
                                onPress={() => {
                                    if (isFullScreenRef.current) {
                                        return;
                                    }
                                    if (!canUseTouchScreen) {
                                        togglePlayCurrentVideo();
                                        return;
                                    }
                                    toggleControl();
                                }}
                                style={[styles.flex1, styles.noSelect]}
                            >
                                {shouldUseSharedVideoElement ? (
                                    <>
                                        <View
                                            ref={sharedVideoPlayerParentRef as MutableRefObject<View | null>}
                                            style={[styles.flex1]}
                                        />
                                        {/* We are adding transparent absolute View between appended video component and control buttons to enable
                                    catching onMouse events from Attachment Carousel. Due to late appending React doesn't handle
                                    element's events properly. */}
                                        <View style={[styles.w100, styles.h100, styles.pAbsolute]} />
                                    </>
                                ) : (
                                    <View
                                        fsClass="fs-exclude"
                                        style={styles.flex1}
                                        ref={(el) => {
                                            if (!el) {
                                                return;
                                            }
                                            const elHTML = el as View | HTMLDivElement;
                                            if ('childNodes' in elHTML && elHTML.childNodes[0]) {
                                                videoPlayerElementRef.current = elHTML.childNodes[0] as HTMLDivElement;
                                            }
                                            videoPlayerElementParentRef.current = el;
                                        }}
                                    >
                                        <Video
                                            ref={videoPlayerRef}
                                            style={[styles.w100, styles.h100, videoPlayerStyle]}
                                            videoStyle={[styles.w100, styles.h100, videoStyle]}
                                            source={{
                                                // if video is loading and is offline, we want to change uri to "" to
                                                // reset the video player after connection is back
                                                uri: !isLoading || (isLoading && !isOffline) ? sourceURL : '',
                                            }}
                                            shouldPlay={shouldPlay}
                                            useNativeControls={false}
                                            resizeMode={resizeMode as ResizeMode}
                                            isLooping={isLooping}
                                            onReadyForDisplay={(e) => {
                                                if (isCurrentlyURLSet && !isUploading) {
                                                    playVideo();
                                                }
                                                onVideoLoaded?.(e);
                                                if (shouldUseNewRate) {
                                                    return;
                                                }
                                                videoPlayerRef.current?.setStatusAsync?.({rate: currentPlaybackSpeed});
                                            }}
                                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                            onFullscreenUpdate={handleFullscreenUpdate}
                                        />
                                    </View>
                                )}
                            </PressableWithoutFeedback>
                            {((isLoading && !isOffline) || (isBuffering && !isPlaying)) && <FullScreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
                            {isLoading && (isOffline || !isBuffering) && <AttachmentOfflineIndicator isPreview={isPreview} />}
                            {controlStatusState !== CONST.VIDEO_PLAYER.CONTROLS_STATUS.HIDE && !isLoading && (isPopoverVisible || isHovered || canUseTouchScreen) && (
                                <VideoPlayerControls
                                    duration={duration}
                                    position={position}
                                    url={url}
                                    videoPlayerRef={videoPlayerRef}
                                    isPlaying={isPlaying}
                                    small={shouldUseSmallVideoControls}
                                    style={[videoControlsStyle, controlsAnimatedStyle]}
                                    togglePlayCurrentVideo={togglePlayCurrentVideo}
                                    controlsStatus={controlStatusState}
                                    showPopoverMenu={showPopoverMenu}
                                />
                            )}
                        </View>
                    )}
                </Hoverable>
            </PressableWithoutFeedback>
            <VideoPopoverMenu
                isPopoverVisible={isPopoverVisible}
                hidePopover={hidePopoverMenu}
                anchorPosition={popoverAnchorPosition}
            />
        </>
    );
}

BaseVideoPlayer.displayName = 'BaseVideoPlayer';

export default BaseVideoPlayer;
