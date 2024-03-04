/* eslint-disable no-underscore-dangle */
import {Video, VideoFullscreenUpdate} from 'expo-av';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Hoverable from '@components/Hoverable';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import VideoPopoverMenu from '@components/VideoPopoverMenu';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as Browser from '@libs/Browser';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import {videoPlayerDefaultProps, videoPlayerPropTypes} from './propTypes';
import shouldReplayVideo from './shouldReplayVideo';
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
    // eslint-disable-next-line no-unused-vars
    isVideoHovered,
}) {
    const styles = useThemeStyles();
    const {pauseVideo, playVideo, currentlyPlayingURL, updateSharedElements, sharedElement, originalParent, shareVideoPlayerElements, currentVideoPlayerRef, updateCurrentlyPlayingURL} =
        usePlaybackContext();
    const [duration, setDuration] = useState(videoDuration * 1000);
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(true);
    const [sourceURL] = useState(url.includes('blob:') || url.includes('file:///') ? url : addEncryptedAuthTokenToURL(url));
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState({horizontal: 0, vertical: 0});
    const videoPlayerRef = useRef(null);
    const videoPlayerElementParentRef = useRef(null);
    const videoPlayerElementRef = useRef(null);
    const sharedVideoPlayerParentRef = useRef(null);
    const videoResumeTryNumber = useRef(0);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const isCurrentlyURLSet = currentlyPlayingURL === url;
    const isUploading = _.some(CONST.ATTACHMENT_LOCAL_URL_PREFIX, (prefix) => url.startsWith(prefix));

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

    const showPopoverMenu = (e) => {
        setPopoverAnchorPosition({horizontal: e.nativeEvent.pageX, vertical: e.nativeEvent.pageY});
        setIsPopoverVisible(true);
    };

    const hidePopoverMenu = () => {
        setIsPopoverVisible(false);
    };

    // fix for iOS mWeb: preventing iOS native player edfault behavior from pausing the video when exiting fullscreen
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
        [playVideo],
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

            onPlaybackStatusUpdate(e);
        },
        [onPlaybackStatusUpdate, preventPausingWhenExitingFullscreen, videoDuration],
    );

    const handleFullscreenUpdate = useCallback(
        (e) => {
            onFullscreenUpdate(e);
            // fix for iOS native and mWeb: when switching to fullscreen and then exiting
            // the fullscreen mode while playing, the video pauses
            if (!isPlaying || e.fullscreenUpdate !== VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
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
        currentVideoPlayerRef.current._onPlaybackStatusUpdate = handlePlaybackStatusUpdate;
        currentVideoPlayerRef.current._onFullscreenUpdate = handleFullscreenUpdate;
        // update states after binding
        currentVideoPlayerRef.current.getStatusAsync().then((status) => {
            handlePlaybackStatusUpdate(status);
        });
    }, [currentVideoPlayerRef, handleFullscreenUpdate, handlePlaybackStatusUpdate]);

    // update shared video elements
    useEffect(() => {
        if (shouldUseSharedVideoElement || url !== currentlyPlayingURL) {
            return;
        }
        shareVideoPlayerElements(videoPlayerRef.current, videoPlayerElementParentRef.current, videoPlayerElementRef.current, isUploading);
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, shareVideoPlayerElements, updateSharedElements, url, isUploading]);

    // append shared video element to new parent (used for example in attachment modal)
    useEffect(() => {
        if (url !== currentlyPlayingURL || !sharedElement || !shouldUseSharedVideoElement) {
            return;
        }

        const newParentRef = sharedVideoPlayerParentRef.current;
        videoPlayerRef.current = currentVideoPlayerRef.current;
        if (currentlyPlayingURL === url) {
            newParentRef.appendChild(sharedElement);
            bindFunctions();
        }
        return () => {
            if (!originalParent && !newParentRef.childNodes[0]) {
                return;
            }
            originalParent.appendChild(sharedElement);
        };
    }, [bindFunctions, currentVideoPlayerRef, currentlyPlayingURL, originalParent, sharedElement, shouldUseSharedVideoElement, url]);

    return (
        <>
            <View style={style}>
                <Hoverable>
                    {(isHovered) => (
                        <View style={[styles.w100, styles.h100]}>
                            <PressableWithoutFeedback
                                accessibilityRole="button"
                                onPress={() => {
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
                                                uri: sourceURL,
                                            }}
                                            shouldPlay={false}
                                            useNativeControls={false}
                                            resizeMode={resizeMode}
                                            isLooping={isLooping}
                                            onReadyForDisplay={onVideoLoaded}
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
