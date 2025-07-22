import {useEvent, useEventListener} from 'expo';
import type {
    MutedChangeEventPayload,
    PlayingChangeEventPayload, // SourceLoadEventPayload,
    StatusChangeEventPayload,
    TimeUpdateEventPayload,
    VideoPlayer,
    VolumeChangeEventPayload,
} from 'expo-video';
import {useVideoPlayer, VideoView} from 'expo-video';
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
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen as canUseTouchScreenLib} from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
// import shouldReplayVideo from './shouldReplayVideo';
// import type {VideoWithOnFullScreenUpdate} from './types';
import type {VideoPlayerProps} from './types';
import useHandleNativeVideoControls from './useHandleNativeVideoControls';
import * as VideoUtils from './utils';
import VideoErrorIndicator from './VideoErrorIndicator';
import VideoPlayerControls from './VideoPlayerControls';

function NewBaseVideoPlayer({
    url,
    // onVideoLoaded,
    // isLooping = false,
    style,
    videoPlayerStyle,
    // videoStyle,
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
        // currentVideoViewRef,
        updateCurrentURLAndReportID,
        videoResumeTryNumberRef,
        setCurrentlyPlayingURL,
    } = usePlaybackContext();
    const {isFullScreenRef} = useFullScreenContext();
    const {isOffline} = useNetwork();
    const [duration, setDuration] = useState(videoDuration);
    // const [position, setPosition] = useState(0);
    // const [isPlaying2, setIsPlaying] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);

    const [isEnded, setIsEnded] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [hasError, setHasError] = useState(false);
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
    const newSourceURL1 = `https://dev.new.expensify.com:8082${sourceURL}`;
    // const newSourceURL1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    const player1 = useVideoPlayer(newSourceURL1, (player) => {
        player.loop = true;
        if (shouldPlay) {
            player.play();
        }
        // player.muted = false;
        player.timeUpdateEventInterval = 0.05;
    });
    /* eslint-enable no-param-reassign */

    const {currentTime, bufferedPosition} = useEvent(player1, 'timeUpdate', {currentTime: 0, bufferedPosition: 0} as TimeUpdateEventPayload);
    // const {muted} = useEvent(player1, 'mutedChange', {muted: false});
    const {isPlaying} = useEvent(player1, 'playingChange', {isPlaying: false});
    // const sourceLoadPayload = useEvent(player1, 'sourceLoad');
    const {status} = useEvent(player1, 'statusChange', {status: 'idle'} as StatusChangeEventPayload);

    const isLoading = useMemo(() => {
        return status === 'loading' || status === 'idle';
    }, [status]);

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
    // currentPlaybackSpeed used below, deleted for hiding
    const {videoPopoverMenuPlayerRef, videoPopoverMenuSource, setCurrentPlaybackSpeed, setSource: setPopoverMenuSource} = useVideoPopoverMenuContext();
    // const {source} = videoPopoverMenuPlayerRef.current?.props ?? {};
    const shouldUseNewRate = !videoPopoverMenuSource.current || videoPopoverMenuSource.current !== sourceURL;

    useEffect(() => {
        videoPlayerRef.current = player1;
    }, [player1]);

    const togglePlayCurrentVideo = useCallback(() => {
        // alert(`play clicked, play state: ${isPlaying}, currentURLSet: ${isCurrentlyURLSet}`);
        setIsEnded(false);
        videoResumeTryNumberRef.current = 0;
        if (!isCurrentlyURLSet) {
            updateCurrentURLAndReportID(url, reportID);
        } else if (player1.playing) {
            pauseVideo();
        } else {
            playVideo();
        }
    }, [isCurrentlyURLSet, pauseVideo, playVideo, player1.playing, reportID, updateCurrentURLAndReportID, url, videoResumeTryNumberRef]);

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

        // videoPlayerRef.current?.getStatusAsync().then((status) => {
        //     if (!('rate' in status && status.rate)) {
        //         return;
        //     }

        // });
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
    const prevIsMuted = useSharedValue(true);
    const prevVolume = useSharedValue(0);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEventListener(player1, 'volumeChange', (payload: VolumeChangeEventPayload) => {
        if (prevIsMuted.get() && prevVolume.get() === 0 && !player1.muted && player1.volume === 0) {
            updateVolume(lastNonZeroVolume.get());
        }
        if (currentVideoPlayerRef.current && isFullScreenRef.current && prevVolume.get() !== 0 && payload.volume === 0 && !player1.muted) {
            // eslint-disable-next-line react-compiler/react-compiler
            currentVideoPlayerRef.current.muted = true;
        }
        prevVolume.set(player1.volume);
    });

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEventListener(player1, 'mutedChange', (payload: MutedChangeEventPayload) => {
        if (prevIsMuted.get() && prevVolume.get() === 0 && !payload.muted && player1.volume === 0) {
            updateVolume(lastNonZeroVolume.get());
        }
        if (currentVideoPlayerRef.current && isFullScreenRef.current && prevVolume.get() !== 0 && player1.volume === 0 && !payload.muted) {
            // eslint-disable-next-line react-compiler/react-compiler
            currentVideoPlayerRef.current.muted = true;
        }
        prevIsMuted.set(payload.muted);
    });

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEventListener(player1, 'playingChange', (payload: PlayingChangeEventPayload) => {
        const isVideoPlaying = payload.isPlaying;
        preventPausingWhenExitingFullscreen(isVideoPlaying);
        // setIsPlaying(isVideoPlaying);
        if (isVideoPlaying && isEnded) {
            setIsEnded(false);
        }
    });

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEventListener(player1, 'statusChange', (payload: StatusChangeEventPayload) => {
        if (payload.status === 'readyToPlay') {
            player1.play();
        }
        if (payload.status === 'loading') {
            preventPausingWhenExitingFullscreen(false);
            player1.pause();
            // setIsPlaying(false);
            // setIsLoading(true); // when video is ready to display duration is not NaN
            setIsBuffering(false);
            // setDuration(videoDuration * 1000);
            // setPosition(0);
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

    useEventListener(player1, 'timeUpdate', (payload: TimeUpdateEventPayload) => {
        if (payload.bufferedPosition > 0) {
            setIsBuffering(false);
        }
        setIsBuffering(true);
    });

    useEventListener(player1, 'playToEnd', () => {
        // if (payload.bufferedPosition > 0) {
        //     setIsBuffering(false);
        // }
        // setIsBuffering(true);
        setIsEnded(true);
        setControlStatusState(CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
        controlsOpacity.set(1);
    });

    // useEventListener(player1, 'sourceLoad', (p: SourceLoadEventPayload) => {
    //     if (hasError) {
    //         setHasError(false);
    //     }
    //     if (!isCurrentlyURLSet || isUploading) {
    //         return;
    //     }
    //     playVideo();
    // });

    // FOR SOME REASON DOESN'T WORK
    // useEventListener(player1, 'sourceLoad', (p: SourceLoadEventPayload) => {
    //     alert(JSON.stringify(p));
    //     console.log(`SOURCELOAD SOURCELOAD ${JSON.stringify(p)}`);
    // });

    useEffect(() => {
        if (!player1.duration) {
            return;
        }
        setDuration(player1.duration);
    }, [player1.duration]);

    // useEffect(() => {
    //     console.log(sourceLoadPayload?.duration);
    //     alert(sourceLoadPayload?.duration);
    //     alert(player1.duration);
    // }, [player1.duration, sourceLoadPayload?.duration]);

    // const handlePlaybackStatusUpdate = useCallback(
    //     (status: AVPlaybackStatus) => {
    // if (!status.isLoaded) {
    //     preventPausingWhenExitingFullscreen(false);
    //     setIsPlaying(false);
    //     // setIsLoading(true); // when video is ready to display duration is not NaN
    //     setIsBuffering(false);
    //     // setDuration(videoDuration * 1000);
    //     // setPosition(0);
    //     onPlaybackStatusUpdate?.(status);
    //     return;
    // }
    // if (status.didJustFinish) {
    //     setIsEnded(status.didJustFinish && !status.isLooping);
    //     setControlStatusState(CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW);
    //     controlsOpacity.set(1);
    // } else if (status.isPlaying && isEnded) {
    //     setIsEnded(false);
    // }

    // These two conditions are essential for the mute and unmute functionality to work properly during
    // fullscreen playback on the web
    // if (prevIsMuted.get() && prevVolume.get() === 0 && !status.isMuted && status.volume === 0) {
    //     updateVolume(lastNonZeroVolume.get());
    // }

    // if (currentVideoPlayerRef.current && isFullScreenRef.current && prevVolume.get() !== 0 && status.volume === 0 && !status.isMuted) {
    // currentVideoPlayerRef.current?.setStatusAsync({isMuted: true});
    //     currentVideoPlayerRef.current.muted = true;
    // }
    // prevIsMuted.set(status.isMuted);
    // prevVolume.set(status.volume);

    // const isVideoPlaying = status.isPlaying;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    // const currentDuration = status.durationMillis || videoDuration * 1000;
    // const currentPosition = status.positionMillis || 0;

    // just set player.loop = true during initialisation
    // if (shouldReplayVideo(status, isVideoPlaying, currentDuration, currentPosition) && !isEnded) {
    //     // videoPlayerRef.current?.setStatusAsync({positionMillis: 0, shouldPlay: true});
    //     if (!videoPlayerRef.current) {
    //         return;
    //     }
    //     videoPlayerRef.current.currentTime = 0;
    //     videoPlayerRef.current.play();
    // }

    // preventPausingWhenExitingFullscreen(isVideoPlaying);
    // setIsPlaying(isVideoPlaying);
    // setIsLoading(Number.isNaN(status.durationMillis)); // when video is ready to display duration is not NaN
    // setIsBuffering(status.isBuffering);
    // setDuration(currentDuration);
    // setPosition(currentPosition);

    // videoStateRef.current = status;
    // onPlaybackStatusUpdate?.(status);
    // },
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to trigger this when isPlaying changes because isPlaying is only used inside shouldReplayVideo
    // [onPlaybackStatusUpdate, preventPausingWhenExitingFullscreen, videoDuration, isEnded],
    // );

    // const handleFullscreenUpdate = useCallback(
    //     (event: VideoFullscreenUpdateEvent) => {
    //         // onFullscreenUpdate?.(event);

    //         if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
    //             // When the video is in fullscreen, we don't want the scroll to be captured by the InvertedFlatList of report screen.
    //             // This will also allow the user to scroll the video playback speed.
    //             if (videoPlayerElementParentRef.current && 'addEventListener' in videoPlayerElementParentRef.current) {
    //                 videoPlayerElementParentRef.current.addEventListener('wheel', stopWheelPropagation);
    //             }
    //         }

    //         if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
    //             if (videoPlayerElementParentRef.current && 'removeEventListener' in videoPlayerElementParentRef.current) {
    //                 videoPlayerElementParentRef.current.removeEventListener('wheel', stopWheelPropagation);
    //             }
    //             isFullScreenRef.current = false;

    //             // Sync volume updates in full screen mode after leaving it
    //             if (videoPlayerRef.current) {
    //                 updateVolume(videoPlayerRef.current.muted ? 0 : videoPlayerRef.current.volume || 1);
    //             }

    //             // we need to use video state ref to check if video is playing, to catch proper state after exiting fullscreen
    //             // and also fix a bug with fullscreen mode dismissing when handleFullscreenUpdate function changes
    //             if (videoPlayerRef.current?.playing) {
    //                 pauseVideo();
    //                 playVideo();
    //                 videoResumeTryNumberRef.current = 3;
    //             }
    //         }
    //     },
    //     [stopWheelPropagation, isFullScreenRef, updateVolume, pauseVideo, playVideo, videoResumeTryNumberRef],
    // );

    // const oldVideoPlayer = useRef<VideoWithOnFullScreenUpdate | null>(null);

    // const bindFunctions = useCallback(() => {
    //     const currentVideoPlayer = oldVideoPlayer.current;
    //     if (!currentVideoPlayer) {
    //         return;
    //     }
    //     currentVideoPlayer._onPlaybackStatusUpdate = handlePlaybackStatusUpdate;
    //     currentVideoPlayer._onFullscreenUpdate = handleFullscreenUpdate;

    //     // update states after binding
    //     currentVideoPlayer.getStatusAsync().then((status) => {
    //         handlePlaybackStatusUpdate(status);
    //     });
    // }, [oldVideoPlayer, handleFullscreenUpdate]);

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
            // currentVideoPlayerRef.current?.setStatusAsync?.({shouldPlay: false, positionMillis: 0}).then(() => {
            //     currentVideoPlayerRef.current = null;
            // });
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
        // alert(`shared playerRef ${JSON.stringify(videoPlayerRef.current)}`);
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

    // Call bindFunctions() through the refs to avoid adding it to the dependency array of the DOM mutation effect, as doing so would change the DOM when the functions update.
    // const bindFunctionsRef = useRef<(() => void) | null>(null);
    // const shouldBindFunctionsRef = useRef(false);

    // useEffect(() => {
    //     bindFunctionsRef.current = bindFunctions;
    //     if (shouldBindFunctionsRef.current) {
    //         bindFunctions();
    //     }
    // }, [bindFunctions]);

    // append shared video element to new parent (used for example in attachment modal)
    useEffect(() => {
        // shouldBindFunctionsRef.current = false;

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
            // bindFunctionsRef.current?.();
            // shouldBindFunctionsRef.current = true;
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

    // useEffect(() => {
    //     videoPlayerRef.current?.setStatusAsync({isMuted: true});
    // }, []);

    // const newSourceURL =
    //     'https://dev.new.expensify.com:8082/chat-attachments/3501106660456596589/w_b90c4ce012c59639d8bf2a2dc4bd3c94bf67729c.mp4?encryptedAuthToken=lYUAjJjM4Wv2CKRpY5jlflT73Glvktb1s2zBGqkVXAclKO94pphbU1aQBzSqAsudkM48XcJhHAGf86JALA3pqSWYwaHhY%2F3Cv8nriDVW5CtAx6p4mLBzGdYeB0TqoFLtda5gFTpNKlVtaVNvEOIplopnqn5%2FURlnf78LnU9GGnNJdqsLKfzH8NbyB8EjOsWgcdvbvjPG7hfiutxZTmZCjjz0ugt521KKzyy41PHwrs8ZT1wRz8xNDc1B%2BngiBybujeGyKnScFRzXEzXoFD%2B1ka%2BUn4kRnwUESYNjC0mYvG2yTijUl%2F6HM5Epjk93lpl5b5EMta7pBqhxIXeQuV9k8wdwhJU2g43gSnFp3hCbquUhRb9rD%2B2m0%2FyHBUgm37mcv%2BlL29EEq9Bi00nfwGozWlFNJFX49HkBap0LAYq5ZkVzq%2FEueaQfqtIQjecck2ZZpDskZEl7HBd6PtRKYqpJl7i9mMfWsKJuHGtpMzGKkahgLZjwiHE5nA%2Fy8p3Gbhypef7kCAHsUM1Zwj%2FRman5RAecc3rFN3JaAH0H2CYUMJyCKRatA7GCgJlwt8lPERdzo1tAEMqfeFGDP%2F7AkFi%2Bgfjimh%2FPGf2ZGLgYOlb5Q6hQl71fYIzjMIteXp2gjIyIPL%2Bo98JPa%2BoFEbFO22gLHRvl5YTDWdMr1%2B6SNvDie1S8AevcNU2q0yzrFbMBXqqnovn2R2yeOXUUDbEs87uH1wuDSZAPjaK%2FNElaSTXAMlw3I0rBBySg9HvP7YanteEKo5F%2FvAGwb%2FYKATZoDkSw5HkeLson5fvCuLqZqPjiKDjMsbQdrBm5WlXAGrVZB9XqOmGtA8ptSY06v9%2FDnSqi6uhRdlx4OTi2QP6x5b5AjX553D7BqA5LNpgkMux3ecM%2FhPLRNqGJuCdldfKqJQuBJy4HmVgQJV1q%2BkhICgScXjc%2F%2B6KoVOUPUn4C7GT6XFMx1haboBUtjF3sjgiCFNJtVPMBC%2Br0c5Ug%2BUjjsuESU%2FsH5CyvDYAicXSCMSMwUEzW';
    // const videoSource = !isLoading || (isLoading && !isOffline) ? newSourceURL : '';
    // const newSourceURL1 = `https://dev.new.expensify.com:8082${sourceURL}`;
    // const newSourceURL2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    // const newSourceURL3 = 'https://www.youtube.com/embed/m4BPx66Byds?si=_7wwk09oqsBCq1SG;controls=0';
    // alert(sourceURL);

    // const {isPlaying: xd} = useEvent(player1, 'playingChange', {isPlaying: player1.playing});
    // alert(xd);

    // useEffect(() => {
    //     console.log(bufferedPosition);
    // }, [bufferedPosition]);

    // useEffect(() => {
    //     console.log(`${isLoading} & ${!isOffline} & ${!hasError} ||| ${bufferedPosition <= 0} & ${!isPlaying} & ${!hasError}`);
    // }, [bufferedPosition, hasError, isLoading, isOffline, isPlaying]);

    // (isLoading && !isOffline && !hasError) || (bufferedPosition <= 0 && !isPlaying && !hasError);

    // useEffect(() => {
    //     if (videoViewRef.current) {
    //         console.log('REF Ref przypisany poprawnie:', videoViewRef.current);
    //     } else {
    //         console.log('REF Ref jest null – coś poszło nie tak');
    //     }
    // }, []);

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
                                        {/* <Video
                                            resizeMode={resizeMode as ResizeMode}
                                            onReadyForDisplay={(e) => {
                                                isReadyForDisplayRef.current = true;
                                                onVideoLoaded?.(e);
                                                if (shouldUseNewRate) {
                                                    return;
                                                }
                                                videoPlayerRef.current?.setStatusAsync?.({rate: currentPlaybackSpeed});
                                            }}
                                            XXX onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                            XXX onFullscreenUpdate={handleFullscreenUpdate}

                                            XXX isLooping={isLooping}
                                            XXX shouldPlay={shouldPlay}
                                            XXX ref={videoPlayerRef}
                                            XXX videoStyle={[styles.w100, styles.h100, videoStyle]}
                                            XXX source={{
                                                // if video is loading and is offline, we want to change uri to "" to
                                                // reset the video player after connection is back
                                                uri: !isLoading || (isLoading && !isOffline) ? sourceURL : '',
                                            }}
                                            XXX useNativeControls={false}
                                            XXX onLoad={() => {
                                                if (hasError) {
                                                    setHasError(false);
                                                }
                                                if (!isCurrentlyURLSet || isUploading) {
                                                    return;
                                                }
                                                playVideo();
                                            }}
                                            XXX onError={() => {
                                                // No need to set hasError while offline, since the offline indicator is already shown.
                                                // Once the user reconnects, if the video is unsupported, the error will be triggered again.
                                                if (isOffline) {
                                                    return;
                                                }
                                                setHasError(true);
                                            }}
                                            XXX testID={CONST.VIDEO_PLAYER_TEST_ID}
                                        /> */}
                                        <VideoView
                                            allowsFullscreen
                                            player={player1}
                                            style={[styles.w100, styles.h100, videoPlayerStyle]}
                                            nativeControls={isFullScreenRef.current}
                                            testID={CONST.VIDEO_PLAYER_TEST_ID}
                                            ref={videoViewRef}
                                            onFullscreenEnter={() => {
                                                isFullScreenRef.current = true;

                                                // onFullscreenUpdate?.(event);

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

                                                updateVolume(player1.muted ? 0 : player1.volume || 1);

                                                // we need to use video state ref to check if video is playing, to catch proper state after exiting fullscreen
                                                // and also fix a bug with fullscreen mode dismissing when handleFullscreenUpdate function changes
                                                if (player1.playing) {
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
