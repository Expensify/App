import {useEvent, useEventListener} from 'expo';
import type {MutedChangeEventPayload, PlayingChangeEventPayload, StatusChangeEventPayload, TimeUpdateEventPayload, VideoPlayer} from 'expo-video';
import {useVideoPlayer, VideoView} from 'expo-video';
import debounce from 'lodash/debounce';
import type {RefObject} from 'react';
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
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen as canUseTouchScreenLib} from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import type VideoPlayerProps from './types';
import useHandleNativeVideoControls from './useHandleNativeVideoControls';
import * as VideoUtils from './utils';
import VideoErrorIndicator from './VideoErrorIndicator';
import VideoPlayerControls from './VideoPlayerControls';

function NewBaseVideoPlayer({
    url,
    isLooping = false,
    style,
    videoPlayerStyle,
    videoControlsStyle,
    videoDuration = 0,
    controlsStatus = CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW,
    shouldUseSharedVideoElement = false,
    shouldUseSmallVideoControls = false,
    shouldPlay,
    // TODO: investigate what is the root cause of the bug with unexpected video switching
    // isVideoHovered caused a bug with unexpected video switching. We are investigating the root cause of the issue,
    // but current workaround is just not to use it here for now. This causes not displaying the video controls when
    // user hovers the mouse over the carousel arrows, but this UI bug feels much less troublesome for now.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // isVideoHovered = false,
    isPreview,
    reportID,
}: VideoPlayerProps & {reportID: string}) {
    const styles = useThemeStyles();
    const {
        pauseVideo,
        playVideo,
        currentlyPlayingURL,
        sharedElement,
        originalParent,
        shareVideoPlayerElements,
        currentVideoPlayerRef,
        updateCurrentURLAndReportID,
        videoResumeTryNumberRef,
        setCurrentlyPlayingURL,
    } = usePlaybackContext();
    const {isFullScreenRef} = useFullScreenContext();
    const {isOffline} = useNetwork();
    const [duration, setDuration] = useState(videoDuration);
    const [isEnded, setIsEnded] = useState(false);
    const [hasError, setHasError] = useState(false);
    // const newSourceURL1 = `https://dev.new.expensify.com:8082${sourceURL}`;
    // const newSourceURL1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    // we add "#t=0.001" at the end of the URL to skip first millisecond of the video and always be able to show proper video preview when video is paused at the beginning
    const [sourceURL] = useState(() => VideoUtils.addSkipTimeTagToURL(url.includes('blob:') || url.includes('file:///') ? url : addEncryptedAuthTokenToURL(url), 0.001));
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState({horizontal: 0, vertical: 0});
    const [controlStatusState, setControlStatusState] = useState(controlsStatus);
    const controlsOpacity = useSharedValue(1);
    const controlsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: controlsOpacity.get(),
    }));

    /* eslint-disable no-param-reassign */
    const videoPlayer = useVideoPlayer(sourceURL, (player) => {
        player.loop = isLooping;
        if (shouldPlay) {
            player.play();
        }
        player.muted = true;
        player.timeUpdateEventInterval = 0.05;
    });
    /* eslint-enable no-param-reassign */

    const {currentTime, bufferedPosition} = useEvent(videoPlayer, 'timeUpdate', {currentTime: 0, bufferedPosition: 0} as TimeUpdateEventPayload);
    const {isPlaying} = useEvent(videoPlayer, 'playingChange', {isPlaying: false});
    const {status} = useEvent(videoPlayer, 'statusChange', {status: 'idle'} as StatusChangeEventPayload);

    const isLoading = useMemo(() => {
        return status === 'loading' || status === 'idle';
    }, [status]);

    const isBuffering = useMemo(() => {
        return bufferedPosition <= 0;
    }, [bufferedPosition]);

    const videoPlayerRef = useRef<VideoPlayer | null>(null);
    const videoViewRef = useRef<VideoView | null>(null);
    const videoPlayerElementParentRef = useRef<View | HTMLDivElement | null>(null);
    const videoPlayerElementRef = useRef<View | HTMLDivElement | null>(null);
    const sharedVideoPlayerParentRef = useRef<View | HTMLDivElement | null>(null);
    const isReadyForDisplayRef = useRef(false);
    const canUseTouchScreen = canUseTouchScreenLib();
    const isCurrentlyURLSet = currentlyPlayingURL === url;
    const isUploading = CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => url.startsWith(prefix));
    const {updateVolume, lastNonZeroVolume} = useVolumeContext();
    useHandleNativeVideoControls({
        videoViewRef,
        isOffline: true,
        isLocalFile: isUploading,
    });
    const {videoPopoverMenuPlayerRef, videoPopoverMenuSource, setCurrentPlaybackSpeed, setSource: setPopoverMenuSource} = useVideoPopoverMenuContext();
    const shouldUseNewRate = !videoPopoverMenuSource.current || videoPopoverMenuSource.current !== sourceURL;

    useEffect(() => {
        videoPlayerRef.current = videoPlayer;
    }, [videoPlayer]);

    const togglePlayCurrentVideo = useCallback(() => {
        setIsEnded(false);
        videoResumeTryNumberRef.current = 0;
        if (!isCurrentlyURLSet) {
            updateCurrentURLAndReportID(url, reportID);
        } else if (videoPlayer.playing) {
            pauseVideo();
        } else {
            playVideo();
        }
    }, [isCurrentlyURLSet, pauseVideo, playVideo, videoPlayer.playing, reportID, updateCurrentURLAndReportID, url, videoResumeTryNumberRef]);

    const hideControl = useCallback(() => {
        if (isEnded) {
            return;
        }

        controlsOpacity.set(withTiming(0, {duration: 500}, () => runOnJS(setControlStatusState)(CONST.VIDEO_PLAYER.CONTROLS_STATUS.HIDE)));
    }, [controlsOpacity, isEnded]);
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
        controlsOpacity.set(1);
    }, [controlStatusState, controlsOpacity, hideControl]);

    const showPopoverMenu = (event?: GestureResponderEvent | KeyboardEvent) => {
        videoPopoverMenuPlayerRef.current = videoPlayerRef.current;
        if (!videoPlayerRef.current?.playbackRate) {
            return;
        }
        if (shouldUseNewRate) {
            setCurrentPlaybackSpeed(videoPlayerRef.current.playbackRate as PlaybackSpeed);
        }
        setIsPopoverVisible(true);

        setPopoverMenuSource(url);
        if (!event || !('nativeEvent' in event)) {
            return;
        }
        setPopoverAnchorPosition({horizontal: event.nativeEvent.pageX, vertical: event.nativeEvent.pageY});
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

    useEventListener(videoPlayer, 'mutedChange', (payload: MutedChangeEventPayload) => {
        if (payload.muted || !payload.oldMuted) {
            return;
        }
        updateVolume(lastNonZeroVolume.get());
    });

    useEventListener(videoPlayer, 'playingChange', (payload: PlayingChangeEventPayload) => {
        const isVideoPlaying = payload.isPlaying;
        preventPausingWhenExitingFullscreen(isVideoPlaying);
        if (isVideoPlaying && isEnded) {
            setIsEnded(false);
        }
    });

    useEventListener(videoPlayer, 'statusChange', (payload: StatusChangeEventPayload) => {
        if (payload.status === 'readyToPlay') {
            videoPlayer.play();
        }
        if (payload.status === 'loading') {
            preventPausingWhenExitingFullscreen(false);
            videoPlayer.pause();
        }
        if (payload.error) {
            // No need to set hasError while offline, since the offline indicator is already shown.
            // Once the user reconnects, if the video is unsupported, the error will be triggered again.
            if (isOffline) {
                return;
            }
            setHasError(true);
        }
    });

    useEventListener(videoPlayer, 'playToEnd', () => {
        setIsEnded(true);
        setControlStatusState(CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
        controlsOpacity.set(1);
    });

    useEffect(() => {
        if (!videoPlayer.duration) {
            return;
        }
        setDuration(videoPlayer.duration);
    }, [videoPlayer.duration]);

    // use `useLayoutEffect` instead of `useEffect` because ref is null when unmount in `useEffect` hook
    // ref url: https://reactjs.org/blog/2020/08/10/react-v17-rc.html#effect-cleanup-timing

    useLayoutEffect(
        () => () => {
            if (shouldUseSharedVideoElement || videoPlayerRef.current !== currentVideoPlayerRef.current) {
                return;
            }
            if (currentVideoPlayerRef.current) {
                currentVideoPlayerRef.current.pause();
                currentVideoPlayerRef.current.currentTime = 0;
                currentVideoPlayerRef.current = null;
            }
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

    const isCurrentlyURLSetRef = useRef<boolean | undefined>(undefined);
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
        // On mobile safari, we need to auto-play when sharing video element here
        shareVideoPlayerElements(
            videoPlayerRef.current,
            videoViewRef.current,
            videoPlayerElementParentRef.current,
            videoPlayerElementRef.current,
            isUploading || isFullScreenRef.current || (!isReadyForDisplayRef.current && !isMobileSafari()),
            {shouldUseSharedVideoElement, url, reportID},
        );
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, shareVideoPlayerElements, url, isUploading, isFullScreenRef, reportID, videoPlayerRef]);

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
    }, [currentVideoPlayerRef, currentlyPlayingURL, isFullScreenRef, originalParent, reportID, sharedElement, shouldUseSharedVideoElement, url]);

    useEffect(() => {
        if (!shouldPlay) {
            return;
        }
        updateCurrentURLAndReportID(url, reportID);
    }, [reportID, shouldPlay, updateCurrentURLAndReportID, url]);

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
                                {shouldUseSharedVideoElement || false ? (
                                    <>
                                        <View
                                            ref={sharedVideoPlayerParentRef as RefObject<View | null>}
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
                                        <VideoView
                                            allowsFullscreen
                                            player={videoPlayer}
                                            style={[styles.w100, styles.h100, videoPlayerStyle]}
                                            nativeControls={isFullScreenRef.current}
                                            testID={CONST.VIDEO_PLAYER_TEST_ID}
                                            ref={videoViewRef}
                                            onFullscreenEnter={() => {
                                                isFullScreenRef.current = true;

                                                if (!(videoPlayerElementParentRef.current && 'addEventListener' in videoPlayerElementParentRef.current)) {
                                                    return;
                                                }
                                                // When the video is in fullscreen, we don't want the scroll to be captured by the InvertedFlatList of report screen.
                                                // This will also allow the user to scroll the video playback speed.
                                                videoPlayerElementParentRef.current.addEventListener('wheel', stopWheelPropagation);
                                            }}
                                            onFullscreenExit={() => {
                                                isFullScreenRef.current = false;

                                                if (videoPlayerElementParentRef.current && 'removeEventListener' in videoPlayerElementParentRef.current) {
                                                    videoPlayerElementParentRef.current.removeEventListener('wheel', stopWheelPropagation);
                                                }

                                                // Sync volume updates in full screen mode after leaving it
                                                updateVolume(videoPlayer.muted ? 0 : videoPlayer.volume || 1);

                                                // we need to use video state ref to check if video is playing, to catch proper state after exiting fullscreen
                                                // and also fix a bug with fullscreen mode dismissing when handleFullscreenUpdate function changes
                                                if (videoPlayer.playing) {
                                                    pauseVideo();
                                                    playVideo();
                                                    videoResumeTryNumberRef.current = 3;
                                                }
                                            }}
                                        />
                                    </View>
                                )}
                            </PressableWithoutFeedback>
                            {hasError && !isBuffering && !isOffline && <VideoErrorIndicator isPreview={isPreview} />}
                            {((isLoading && !isOffline && !hasError) || (bufferedPosition <= 0 && !isPlaying && !hasError)) && (
                                <FullScreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />
                            )}
                            {isLoading && (isOffline || !isBuffering) && <AttachmentOfflineIndicator isPreview={isPreview} />}
                            {((controlStatusState !== CONST.VIDEO_PLAYER.CONTROLS_STATUS.HIDE && !isLoading && (isPopoverVisible || isHovered || canUseTouchScreen || isEnded)) || true) && (
                                <VideoPlayerControls
                                    duration={duration ?? 0}
                                    position={currentTime ?? 0}
                                    url={url}
                                    videoPlayerRef={videoPlayerRef}
                                    videoViewRef={videoViewRef}
                                    isPlaying={isPlaying}
                                    small={shouldUseSmallVideoControls}
                                    style={[videoControlsStyle, controlsAnimatedStyle]}
                                    togglePlayCurrentVideo={togglePlayCurrentVideo}
                                    controlsStatus={controlStatusState}
                                    showPopoverMenu={showPopoverMenu}
                                    reportID={reportID}
                                />
                            )}
                        </View>
                    )}
                </Hoverable>
            </PressableWithoutFeedback>
            <VideoPopoverMenu
                isPopoverVisible={isPopoverVisible}
                hidePopover={() => setIsPopoverVisible(false)}
                anchorPosition={popoverAnchorPosition}
            />
        </>
    );
}

NewBaseVideoPlayer.displayName = 'NewBaseVideoPlayer';

export default NewBaseVideoPlayer;
