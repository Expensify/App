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

function BaseVideoPlayer({
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
        replayVideo,
        currentlyPlayingURL,
        sharedElement,
        originalParent,
        shareVideoPlayerElements,
        currentVideoPlayerRef,
        currentVideoViewRef,
        updateCurrentURLAndReportID,
        setCurrentlyPlayingURL,
    } = usePlaybackContext();
    const {isFullScreenRef} = useFullScreenContext();
    const {isOffline} = useNetwork();
    const [duration, setDuration] = useState(videoDuration);
    const [isEnded, setIsEnded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    // const newSourceURL1 = `https://dev.new.expensify.com:8082${sourceURL}`;
    // const sourceURL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
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
    const videoPlayerRef = useRef<VideoPlayer>(
        useVideoPlayer(sourceURL, (player) => {
            player.loop = isLooping;
            player.muted = true;
            player.timeUpdateEventInterval = 0.1;
        }),
    );
    /* eslint-enable no-param-reassign */

    const {currentTime, bufferedPosition} = useEvent(videoPlayerRef.current, 'timeUpdate', {currentTime: 0, bufferedPosition: 0} as TimeUpdateEventPayload);
    const {isPlaying} = useEvent(videoPlayerRef.current, 'playingChange', {isPlaying: false});
    const {status} = useEvent(videoPlayerRef.current, 'statusChange', {status: 'idle'} as StatusChangeEventPayload);

    const isLoading = useMemo(() => {
        return status === 'loading' || (status === 'idle' && !isEnded);
    }, [isEnded, status]);

    const isBuffering = useMemo(() => {
        return bufferedPosition <= 0;
    }, [bufferedPosition]);

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

    const togglePlayCurrentVideo = useCallback(() => {
        if (!isCurrentlyURLSet) {
            updateCurrentURLAndReportID(url, reportID);
        } else if (videoPlayerRef.current.playing && !isLoading) {
            pauseVideo();
        } else if (!isLoading) {
            if (isEnded) {
                replayVideo();
            }
            playVideo();
        }
        setIsEnded(false);
    }, [isCurrentlyURLSet, isLoading, updateCurrentURLAndReportID, url, reportID, pauseVideo, isEnded, playVideo, replayVideo]);

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

    useEventListener(videoPlayerRef.current, 'mutedChange', (payload: MutedChangeEventPayload) => {
        if (payload.muted || !payload.oldMuted) {
            return;
        }
        updateVolume(lastNonZeroVolume.get());
    });

    useEventListener(videoPlayerRef.current, 'playingChange', (payload: PlayingChangeEventPayload) => {
        const isVideoPlaying = payload.isPlaying;
        if (isVideoPlaying && isEnded) {
            setIsEnded(false);
        }
    });

    useEventListener(videoPlayerRef.current, 'statusChange', (payload: StatusChangeEventPayload) => {
        if (payload.status === 'readyToPlay' && isFirstLoad) {
            playVideo();
            setIsFirstLoad(false);
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

    useEventListener(videoPlayerRef.current, 'playToEnd', () => {
        setIsEnded(true);
        setControlStatusState(CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
        controlsOpacity.set(1);
    });

    useEffect(() => {
        if (!videoPlayerRef.current.duration) {
            return;
        }
        setDuration(videoPlayerRef.current.duration);
    }, [videoPlayerRef.current.duration]);

    // use `useLayoutEffect` instead of `useEffect` because ref is null when unmount in `useEffect` hook
    // ref url: https://reactjs.org/blog/2020/08/10/react-v17-rc.html#effect-cleanup-timing

    useLayoutEffect(
        () => () => {
            if (shouldUseSharedVideoElement || videoPlayerRef.current !== currentVideoPlayerRef.current) {
                return;
            }
            if (currentVideoPlayerRef.current) {
                currentVideoPlayerRef.current.pause();
                // eslint-disable-next-line react-compiler/react-compiler
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
        currentVideoViewRef.current = videoViewRef.current;
    }, [url, currentVideoPlayerRef, isUploading, pauseVideo, currentVideoViewRef]);

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
        if (currentVideoPlayerRef.current) {
            videoPlayerRef.current = currentVideoPlayerRef.current;
            videoViewRef.current = currentVideoViewRef.current;
        }
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
    }, [currentVideoPlayerRef, currentVideoViewRef, currentlyPlayingURL, isFullScreenRef, originalParent, reportID, sharedElement, shouldUseSharedVideoElement, url]);

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
                                            player={videoPlayerRef.current}
                                            style={[styles.w100, styles.h100, videoPlayerStyle]}
                                            nativeControls={isFullScreenRef.current}
                                            playsInline
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
                                                updateVolume(videoPlayerRef.current.muted ? 0 : videoPlayerRef.current.volume || 1);
                                            }}
                                        />
                                    </View>
                                )}
                            </PressableWithoutFeedback>
                            {hasError && !isBuffering && !isOffline && <VideoErrorIndicator isPreview={isPreview} />}
                            {((isLoading && !isOffline && !hasError) || (isBuffering && !isPlaying && !hasError)) && (
                                <FullScreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />
                            )}
                            {isLoading && (isOffline || !isBuffering) && <AttachmentOfflineIndicator isPreview={isPreview} />}
                            {controlStatusState !== CONST.VIDEO_PLAYER.CONTROLS_STATUS.HIDE && (isPopoverVisible || isHovered || canUseTouchScreen || isEnded) && (
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

BaseVideoPlayer.displayName = 'BaseVideoPlayer';

export default BaseVideoPlayer;
