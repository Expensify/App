/* eslint-disable no-underscore-dangle */
import {Video, VideoFullscreenUpdate} from 'expo-av';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Hoverable from '@components/Hoverable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {useFullScreenContext} from '@components/VideoPlayerContexts/FullScreenContext';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import VideoPopoverMenu from '@components/VideoPopoverMenu';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import {videoPlayerDefaultProps, videoPlayerPropTypes} from './propTypes';
import shouldReplayVideo from './shouldReplayVideo';
import * as VideoUtils from './utils';
import VideoPlayerControls from './VideoPlayerControls';

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
    // eslint-disable-next-line no-unused-vars
    isVideoHovered,
}) {
    const styles = useThemeStyles();
    const {
        pauseVideo,
        playVideo,
        currentlyPlayingURL,
        updateSharedElements,
        sharedElement,
        originalParent,
        shareVideoPlayerElements,
        currentVideoPlayerRef,
        updateCurrentlyPlayingURL,
        videoResumeTryNumber,
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
    const videoPlayerRef = useRef(null);
    const videoPlayerElementParentRef = useRef(null);
    const videoPlayerElementRef = useRef(null);
    const sharedVideoPlayerParentRef = useRef(null);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const isCurrentlyURLSet = currentlyPlayingURL === url;
    const isUploading = _.some(CONST.ATTACHMENT_LOCAL_URL_PREFIX, (prefix) => url.startsWith(prefix));
    const videoStateRef = useRef(null);

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

    const showPopoverMenu = (e) => {
        setPopoverAnchorPosition({horizontal: e.nativeEvent.pageX, vertical: e.nativeEvent.pageY});
        setIsPopoverVisible(true);
    };

    const hidePopoverMenu = () => {
        setIsPopoverVisible(false);
    };

    // fix for iOS mWeb: preventing iOS native player default behavior from pausing the video when exiting fullscreen
    const preventPausingWhenExitingFullscreen = useCallback(
        (isVideoPlaying) => {
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
        (e) => {
            const isVideoPlaying = e.isPlaying || false;
            const currentDuration = e.durationMillis || videoDuration * 1000;
            const currentPositon = e.positionMillis || 0;

            if (shouldReplayVideo(e, isVideoPlaying, currentDuration, currentPositon)) {
                videoPlayerRef.current.setStatusAsync({positionMillis: 0, shouldPlay: true});
            }

            preventPausingWhenExitingFullscreen(isVideoPlaying);
            setIsPlaying(isVideoPlaying);
            setIsLoading(!e.isLoaded || Number.isNaN(e.durationMillis)); // when video is ready to display duration is not NaN
            setIsBuffering(e.isBuffering || false);
            setDuration(currentDuration);
            setPosition(currentPositon);
            videoStateRef.current = e;
            onPlaybackStatusUpdate(e);
        },
        [onPlaybackStatusUpdate, preventPausingWhenExitingFullscreen, videoDuration],
    );

    const handleFullscreenUpdate = useCallback(
        (e) => {
            onFullscreenUpdate(e);
            // fix for iOS native and mWeb: when switching to fullscreen and then exiting
            // the fullscreen mode while playing, the video pauses
            if (e.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
                isFullScreenRef.current = false;
                // we need to use video state ref to check if video is playing, to catch proper state after exiting fullscreen
                // and also fix a bug with fullscreen mode dismissing when handleFullscreenUpdate function changes
                if (videoStateRef.current && videoStateRef.current.isPlaying) {
                    pauseVideo();
                    playVideo();
                    videoResumeTryNumber.current = 3;
                }
            }
        },
        [isFullScreenRef, onFullscreenUpdate, pauseVideo, playVideo, videoResumeTryNumber],
    );

    const bindFunctions = useCallback(() => {
        currentVideoPlayerRef.current._onPlaybackStatusUpdate = handlePlaybackStatusUpdate;
        currentVideoPlayerRef.current._onFullscreenUpdate = handleFullscreenUpdate;

        // Update states after binding
        currentVideoPlayerRef.current.getStatusAsync().then((status) => {
            handlePlaybackStatusUpdate(status);
        });
    }, [currentVideoPlayerRef, handleFullscreenUpdate, handlePlaybackStatusUpdate]);

    useEffect(() => {
        if (!isUploading || !videoPlayerRef.current) {
            return;
        }

        // If we are uploading a new video, we want to immediately set the video player ref.
        currentVideoPlayerRef.current = videoPlayerRef.current;
    }, [url, currentVideoPlayerRef, isUploading]);

    // update shared video elements
    useEffect(() => {
        if (shouldUseSharedVideoElement || url !== currentlyPlayingURL || isFullScreenRef.current) {
            return;
        }
        shareVideoPlayerElements(videoPlayerRef.current, videoPlayerElementParentRef.current, videoPlayerElementRef.current, isUploading);
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, shareVideoPlayerElements, updateSharedElements, url, isUploading, isFullScreenRef]);

    // append shared video element to new parent (used for example in attachment modal)
    useEffect(() => {
        if (url !== currentlyPlayingURL || !sharedElement || isFullScreenRef.current) {
            return;
        }

        const newParentRef = sharedVideoPlayerParentRef.current;

        if (!shouldUseSharedVideoElement) {
            if (newParentRef && newParentRef.childNodes[0] && newParentRef.childNodes[0].remove) {
                newParentRef.childNodes[0].remove();
            }
            return;
        }

        videoPlayerRef.current = currentVideoPlayerRef.current;
        if (currentlyPlayingURL === url) {
            newParentRef.appendChild(sharedElement);
            bindFunctions();
        }
        return () => {
            if (!originalParent && !newParentRef.childNodes[0]) {
                return;
            }
            newParentRef.childNodes[0].remove();
            originalParent.appendChild(sharedElement);
        };
    }, [bindFunctions, currentVideoPlayerRef, currentlyPlayingURL, isFullScreenRef, originalParent, sharedElement, shouldUseSharedVideoElement, url]);

    return (
        <>
            {/* We need to wrap the video component in a component that will catch unhandled pointer events. Otherwise, these
            events will bubble up the tree, and it will cause unexpected press behavior. */}
            <PressableWithoutFeedback
                accessibilityRole="button"
                style={[styles.cursorDefault, style]}
            >
                <Hoverable>
                    {(isHovered) => (
                        <View style={[styles.w100, styles.h100]}>
                            <PressableWithoutFeedback
                                accessibilityRole="button"
                                onPress={() => {
                                    if (isFullScreenRef.current) {
                                        return;
                                    }
                                    togglePlayCurrentVideo();
                                }}
                                style={styles.flex1}
                            >
                                {shouldUseSharedVideoElement ? (
                                    <>
                                        <View
                                            ref={sharedVideoPlayerParentRef}
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
                                            videoPlayerElementParentRef.current = el;
                                            if (el.childNodes && el.childNodes[0]) {
                                                videoPlayerElementRef.current = el.childNodes[0];
                                            }
                                        }}
                                    >
                                        <Video
                                            ref={videoPlayerRef}
                                            style={[styles.w100, styles.h100, videoPlayerStyle]}
                                            videoStyle={[styles.w100, styles.h100, videoStyle]}
                                            source={{
                                                // if video is loading and is offline, we want to change uri to null to
                                                // reset the video player after connection is back
                                                uri: !isLoading || (isLoading && !isOffline) ? sourceURL : null,
                                            }}
                                            shouldPlay={false}
                                            useNativeControls={false}
                                            resizeMode={resizeMode}
                                            isLooping={isLooping}
                                            onReadyForDisplay={(e) => {
                                                if (isCurrentlyURLSet && !isUploading) {
                                                    playVideo();
                                                }
                                                onVideoLoaded(e);
                                            }}
                                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                            onFullscreenUpdate={handleFullscreenUpdate}
                                        />
                                    </View>
                                )}
                            </PressableWithoutFeedback>

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
            </PressableWithoutFeedback>
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
