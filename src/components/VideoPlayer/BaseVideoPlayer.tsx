/* eslint-disable no-underscore-dangle */
import type {AVPlaybackStatus, VideoFullscreenUpdateEvent} from 'expo-av';
import {ResizeMode, Video, VideoFullscreenUpdate} from 'expo-av';
import type {MutableRefObject} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Hoverable from '@components/Hoverable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import VideoPopoverMenu from '@components/VideoPopoverMenu';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as Browser from '@libs/Browser';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import {videoPlayerDefaultProps, videoPlayerPropTypes} from './propTypes';
import shouldReplayVideo from './shouldReplayVideo';
import type VideoPlayerProps from './types';
import VideoPlayerControls from './VideoPlayerControls';

const isMobileSafari = Browser.isMobileSafari();

function BaseVideoPlayer({
    url,
    resizeMode,
    onVideoLoaded,
    isLooping,
    style,
    videoPlayerStyle,
    videoStyle,
    videoControlsStyle,
    videoDuration,
    shouldUseSharedVideoElement,
    shouldUseSmallVideoControls,
    shouldShowVideoControls,
    onPlaybackStatusUpdate,
    onFullscreenUpdate,
    // TODO: investigate what is the root cause of the bug with unexpected video switching
    // isVideoHovered caused a bug with unexpected video switching. We are investigating the root cause of the issue,
    // but current workaround is just not to use it here for now. This causes not displaying the video controls when
    // user hovers the mouse over the carousel arrows, but this UI bug feels much less troublesome for now.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isVideoHovered,
}: VideoPlayerProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {pauseVideo, playVideo, currentlyPlayingURL, sharedElement, originalParent, shareVideoPlayerElements, currentVideoPlayerRef, updateCurrentlyPlayingURL} = usePlaybackContext();
    const [duration, setDuration] = useState(videoDuration * 1000);
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(true);
    const [sourceURL] = useState(url.includes('blob:') || url.includes('file:///') ? url : addEncryptedAuthTokenToURL(url));
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState({horizontal: 0, vertical: 0});
    const videoPlayerRef = useRef<Video | null>(null);
    const videoPlayerElementParentRef = useRef<View | HTMLDivElement | null>(null);
    const videoPlayerElementRef = useRef<View | HTMLDivElement | null>(null);
    const sharedVideoPlayerParentRef = useRef<View | HTMLDivElement | null>(null);
    const videoResumeTryNumber = useRef(0);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const isCurrentlyURLSet = currentlyPlayingURL === url;
    const isUploading = CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => url.startsWith(prefix));

    const togglePlayCurrentVideo = useCallback(() => {
        videoResumeTryNumber.current = 0;
        if (!isCurrentlyURLSet) {
            updateCurrentlyPlayingURL(url);
        } else if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    }, [isCurrentlyURLSet, isPlaying, pauseVideo, playVideo, updateCurrentlyPlayingURL, url]);

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

    // fix for iOS mWeb: preventing iOS native player edfault behavior from pausing the video when exiting fullscreen
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
        [playVideo],
    );

    const handlePlaybackStatusUpdate = useCallback(
        (status: AVPlaybackStatus) => {
            if (!status.isLoaded) {
                setIsLoading(true);
                preventPausingWhenExitingFullscreen(false);
                setIsBuffering(false);
                setPosition(0);
                return;
            }
            if (shouldReplayVideo(status, isPlaying, duration, position)) {
                videoPlayerRef.current?.setStatusAsync({positionMillis: 0, shouldPlay: true});
            }
            const isVideoPlaying = status.isPlaying;
            preventPausingWhenExitingFullscreen(isVideoPlaying);
            setIsPlaying(isVideoPlaying);
            setIsLoading(Number.isNaN(status.durationMillis)); // when video is ready to display duration is not NaN
            setIsBuffering(status.isBuffering);
            // in this case nullish coalescing has different behaviour than logical or
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            setDuration(status.durationMillis || videoDuration * 1000);
            setPosition(status.positionMillis || 0);

            onPlaybackStatusUpdate(status);
        },
        [onPlaybackStatusUpdate, preventPausingWhenExitingFullscreen, videoDuration, isPlaying, duration, position],
    );

    const handleFullscreenUpdate = useCallback(
        (event: VideoFullscreenUpdateEvent) => {
            onFullscreenUpdate(event);
            // fix for iOS native and mWeb: when switching to fullscreen and then exiting
            // the fullscreen mode while playing, the video pauses
            if (!isPlaying || event.fullscreenUpdate !== VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
                return;
            }

            if (isMobileSafari) {
                pauseVideo();
            }
            playVideo();
            videoResumeTryNumber.current = 3;
        },
        [isPlaying, onFullscreenUpdate, pauseVideo, playVideo],
    );

    const bindFunctions = useCallback(() => {
        const currentVideoPlayer = currentVideoPlayerRef.current;
        if (!currentVideoPlayer) {
            return;
        }
        currentVideoPlayer._onPlaybackStatusUpdate = handlePlaybackStatusUpdate;
        if ('_onFullscreenUpdate' in currentVideoPlayer) {
            currentVideoPlayer._onFullscreenUpdate = handleFullscreenUpdate;
        }
        // update states after binding
        currentVideoPlayer.getStatusAsync().then((status) => {
            handlePlaybackStatusUpdate(status);
        });
    }, [currentVideoPlayerRef, handleFullscreenUpdate, handlePlaybackStatusUpdate]);

    // update shared video elements
    useEffect(() => {
        if (shouldUseSharedVideoElement || url !== currentlyPlayingURL) {
            return;
        }
        shareVideoPlayerElements(videoPlayerRef.current, videoPlayerElementParentRef.current as View | null, videoPlayerElementRef.current as View | null, isUploading);
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, shareVideoPlayerElements, url, isUploading]);

    // append shared video element to new parent (used for example in attachment modal)
    useEffect(() => {
        const newParentRef = sharedVideoPlayerParentRef.current;
        if (url !== currentlyPlayingURL || !sharedElement || !shouldUseSharedVideoElement || !newParentRef) {
            return;
        }
        videoPlayerRef.current = currentVideoPlayerRef.current;
        if (currentlyPlayingURL === url && 'appendChild' in newParentRef) {
            newParentRef.appendChild(sharedElement as HTMLDivElement);
            bindFunctions();
        }
        return () => {
            if (!originalParent || ('childNodes' in newParentRef && !newParentRef.childNodes[0]) || !('appendChild' in originalParent)) {
                return;
            }
            originalParent.appendChild(sharedElement as HTMLDivElement);
        };
    }, [bindFunctions, currentVideoPlayerRef, currentlyPlayingURL, isSmallScreenWidth, originalParent, sharedElement, shouldUseSharedVideoElement, url]);

    return (
        <>
            <View style={style}>
                <Hoverable>
                    {(isHovered) => (
                        <View style={[styles.w100, styles.h100]}>
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
                                        const el2 = el as View | HTMLDivElement;

                                        if ('childNodes' in el2 && el2.childNodes[0]) {
                                            videoPlayerElementRef.current = el2.childNodes[0] as HTMLDivElement;
                                            return;
                                        }
                                        videoPlayerElementParentRef.current = el;
                                    }}
                                >
                                    <PressableWithoutFeedback
                                        accessibilityRole="button"
                                        accessible={false}
                                        onPress={() => {
                                            togglePlayCurrentVideo();
                                        }}
                                        style={styles.flex1}
                                    >
                                        <Video
                                            ref={videoPlayerRef}
                                            style={[styles.w100, styles.h100, videoPlayerStyle]}
                                            videoStyle={[styles.w100, styles.h100, videoStyle]}
                                            source={{
                                                uri: sourceURL,
                                            }}
                                            shouldPlay={false}
                                            useNativeControls={false}
                                            resizeMode={ResizeMode[resizeMode as keyof typeof ResizeMode]}
                                            isLooping={isLooping}
                                            onReadyForDisplay={onVideoLoaded}
                                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                            onFullscreenUpdate={handleFullscreenUpdate}
                                        />
                                    </PressableWithoutFeedback>
                                </View>
                            )}

                            {(isLoading || isBuffering) && <FullScreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}

                            {shouldShowVideoControls && !isLoading && (isPopoverVisible || isHovered || canUseTouchScreen) && (
                                <VideoPlayerControls
                                    duration={duration}
                                    position={position}
                                    url={url}
                                    videoPlayerRef={videoPlayerRef}
                                    isPlaying={isPlaying}
                                    small={shouldUseSmallVideoControls}
                                    style={videoControlsStyle}
                                    togglePlayCurrentVideo={togglePlayCurrentVideo}
                                    showPopoverMenu={showPopoverMenu}
                                />
                            )}
                        </View>
                    )}
                </Hoverable>
            </View>
            <VideoPopoverMenu
                isPopoverVisible={isPopoverVisible}
                hidePopover={hidePopoverMenu}
                anchorPosition={popoverAnchorPosition}
            />
        </>
    );
}

BaseVideoPlayer.propTypes = videoPlayerPropTypes;
BaseVideoPlayer.defaultProps = videoPlayerDefaultProps;
BaseVideoPlayer.displayName = 'BaseVideoPlayer';

export default BaseVideoPlayer;
