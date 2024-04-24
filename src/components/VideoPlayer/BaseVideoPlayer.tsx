/* eslint-disable no-underscore-dangle */
import type {AVPlaybackStatus, VideoFullscreenUpdateEvent} from 'expo-av';
import {ResizeMode, Video, VideoFullscreenUpdate} from 'expo-av';
import type {MutableRefObject} from 'react';
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Hoverable from '@components/Hoverable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {useFullScreenContext} from '@components/VideoPlayerContexts/FullScreenContext';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
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
        videoResumeTryNumber,
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

    const videoPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);
    const videoPlayerElementParentRef = useRef<View | HTMLDivElement | null>(null);
    const videoPlayerElementRef = useRef<View | HTMLDivElement | null>(null);
    const sharedVideoPlayerParentRef = useRef<View | HTMLDivElement | null>(null);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const isCurrentlyURLSet = currentlyPlayingURL === url;
    const isUploading = CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => url.startsWith(prefix));
    const videoStateRef = useRef<AVPlaybackStatus | null>(null);
    const {updateVolume} = useVolumeContext();

    const togglePlayCurrentVideo = useCallback(() => {
        videoResumeTryNumber.current = 0;
        if (!isCurrentlyURLSet) {
            updateCurrentlyPlayingURL(url);
        } else if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    }, [isCurrentlyURLSet, isPlaying, pauseVideo, playVideo, updateCurrentlyPlayingURL, url, videoResumeTryNumber]);

    const showPopoverMenu = (event?: GestureResponderEvent | KeyboardEvent) => {
        setIsPopoverVisible(true);
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
            if (videoResumeTryNumber.current === 0 || isVideoPlaying) {
                return;
            }
            if (videoResumeTryNumber.current === 1) {
                playVideo();
            }
            videoResumeTryNumber.current -= 1;
        },
        [playVideo, videoResumeTryNumber],
    );

    const handlePlaybackStatusUpdate = useCallback(
        (status: AVPlaybackStatus) => {
            if (!status.isLoaded) {
                preventPausingWhenExitingFullscreen(false);
                setIsPlaying(false);
                setIsLoading(false); // when video is ready to display duration is not NaN
                setIsBuffering(false);
                setDuration(videoDuration * 1000);
                setPosition(0);
                onPlaybackStatusUpdate?.(status);
                return;
            }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to trigger this when isPlaying changes because isPlaying is only used inside shouldReplayVideo
        [onPlaybackStatusUpdate, preventPausingWhenExitingFullscreen, videoDuration],
    );

    const handleFullscreenUpdate = useCallback(
        (event: VideoFullscreenUpdateEvent) => {
            onFullscreenUpdate?.(event);

            if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
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
                    videoResumeTryNumber.current = 3;
                }
            }
        },
        [isFullScreenRef, onFullscreenUpdate, pauseVideo, playVideo, videoResumeTryNumber, updateVolume, currentVideoPlayerRef],
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

        // If we are uploading a new video, we want to immediately set the video player ref.
        currentVideoPlayerRef.current = videoPlayerRef.current;
    }, [url, currentVideoPlayerRef, isUploading]);

    const isCurrentlyURLSetRef = useRef<boolean>();
    isCurrentlyURLSetRef.current = isCurrentlyURLSet;

    useEffect(
        () => () => {
            if (!isCurrentlyURLSetRef.current) {
                return;
            }

            setCurrentlyPlayingURL(null);
        },
        [setCurrentlyPlayingURL],
    );
    // update shared video elements
    useEffect(() => {
        if (shouldUseSharedVideoElement || url !== currentlyPlayingURL || isFullScreenRef.current) {
            return;
        }
        shareVideoPlayerElements(videoPlayerRef.current, videoPlayerElementParentRef.current, videoPlayerElementRef.current, isUploading);
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

    return (
        <>
            {/* We need to wrap the video component in a component that will catch unhandled pointer events. Otherwise, these
            events will bubble up the tree, and it will cause unexpected press behavior. */}
            <PressableWithoutFeedback
                accessibilityRole="button"
                accessible={false}
                style={[styles.cursorDefault, style]}
            >
                <Hoverable>
                    {(isHovered) => (
                        <View style={[styles.w100, styles.h100]}>
                            <PressableWithoutFeedback
                                accessibilityRole="button"
                                accessible={false}
                                onPress={() => {
                                    if (isFullScreenRef.current) {
                                        return;
                                    }
                                    togglePlayCurrentVideo();
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
                                            }}
                                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                            onFullscreenUpdate={handleFullscreenUpdate}
                                        />
                                    </View>
                                )}
                            </PressableWithoutFeedback>

                            {(isLoading || isBuffering) && <FullScreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}

                            {controlsStatus !== CONST.VIDEO_PLAYER.CONTROLS_STATUS.HIDE && !isLoading && (isPopoverVisible || isHovered || canUseTouchScreen) && (
                                <VideoPlayerControls
                                    duration={duration}
                                    position={position}
                                    url={url}
                                    videoPlayerRef={videoPlayerRef}
                                    isPlaying={isPlaying}
                                    small={shouldUseSmallVideoControls}
                                    style={videoControlsStyle}
                                    togglePlayCurrentVideo={togglePlayCurrentVideo}
                                    controlsStatus={controlsStatus}
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
