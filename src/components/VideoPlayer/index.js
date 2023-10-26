import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {Video, ResizeMode} from 'expo-av';
import _ from 'underscore';
import styles from '../../styles/styles';
import {usePlaybackContext} from '../VideoPlayerContexts/PlaybackContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import VideoPlayerControls from './VideoPlayerControls';
import VideoPopoverMenu from '../VideoPopoverMenu';

const propTypes = {
    url: PropTypes.string.isRequired,

    shouldPlay: PropTypes.bool,

    onVideoLoaded: PropTypes.func,

    resizeMode: PropTypes.string,

    isLooping: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),

    // eslint-disable-next-line react/forbid-prop-types
    videoStyle: PropTypes.arrayOf(PropTypes.object),

    shouldUseSharedVideoElement: PropTypes.bool,
};

const defaultProps = {
    shouldPlay: false,
    onVideoLoaded: () => {},
    resizeMode: ResizeMode.CONTAIN,
    isLooping: false,
    style: [styles.w100, styles.h100],
    videoStyle: [styles.w100, styles.h100],
    shouldUseSharedVideoElement: false,
};

function VideoPlayer({url, resizeMode, shouldPlay, onVideoLoaded, isLooping, style, videoStyle, shouldUseSharedVideoElement}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {currentlyPlayingURL, updateSharedElements, sharedElement, originalParent, updateCurrentVideoPlayerRef, updateDuration, updatePosition, duration, position, isPlaying} =
        usePlaybackContext();

    const [isVideoLoading, setIsVideoLoading] = React.useState(true);
    const [isMenuActive, setIsMenuActive] = React.useState(false);

    const ref = useRef(null);
    const videoPlayerParentRef = useRef(null);
    const videoPlayerRef = useRef(null);
    const sharedVideoPlayerParentRef = useRef(null);

    const toggleCreateMenu = (e) => {
        if (isMenuActive) {
            setIsMenuActive(false);
        } else {
            setIsMenuActive(true);
        }
    };

    useEffect(() => {
        if (shouldUseSharedVideoElement || url !== currentlyPlayingURL) {
            return;
        }
        updateSharedElements(videoPlayerParentRef.current, videoPlayerRef.current);
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, updateSharedElements, url]);

    // shared element transition logic for video player
    useEffect(() => {
        if (!shouldUseSharedVideoElement) {
            return;
        }
        const newParentRef = sharedVideoPlayerParentRef.current;
        if (currentlyPlayingURL === url) {
            newParentRef.appendChild(sharedElement);
        }
        return () => {
            if (!newParentRef.childNodes[0]) {
                return;
            }
            originalParent.appendChild(sharedElement);
        };
    }, [currentlyPlayingURL, isSmallScreenWidth, originalParent, sharedElement, shouldUseSharedVideoElement, url]);

    useEffect(() => {
        if (currentlyPlayingURL === url && !shouldUseSharedVideoElement) {
            updateCurrentVideoPlayerRef(ref.current);
        }
        return () => {};
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, updateCurrentVideoPlayerRef, url]);

    return (
        <View style={[styles.w100, styles.h100]}>
            {shouldUseSharedVideoElement ? (
                <View
                    ref={sharedVideoPlayerParentRef}
                    style={[styles.flex1]}
                />
            ) : (
                <View
                    style={styles.flex1}
                    ref={(el) => {
                        if (!el) {
                            return;
                        }
                        videoPlayerParentRef.current = el;
                        if (el.childNodes[0]) {
                            videoPlayerRef.current = el.childNodes[0];
                        }
                    }}
                >
                    <View style={styles.flex1}>
                        <Video
                            ref={ref}
                            style={style}
                            videoStyle={videoStyle}
                            source={{
                                uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                            }}
                            shouldPlay={shouldPlay}
                            useNativeControls={false}
                            resizeMode={resizeMode}
                            isLooping={isLooping}
                            onReadyForDisplay={(e) => {
                                if (!isVideoLoading) {
                                    return;
                                }
                                setIsVideoLoading(false);
                                onVideoLoaded(e);
                            }}
                            onLoadStart={() => setIsVideoLoading(true)}
                            onPlaybackStatusUpdate={(e) => {
                                if (!isPlaying) {
                                    return;
                                }
                                const videoDuration = e.durationMillis;
                                if (videoDuration > 0 && !_.isNaN(videoDuration)) {
                                    updateDuration(videoDuration);
                                }
                                updatePosition(e.positionMillis);
                            }}
                        />
                    </View>
                </View>
            )}

            <VideoPlayerControls
                duration={duration}
                position={position}
                toggleCreateMenu={toggleCreateMenu}
                url={url}
            />

            <VideoPopoverMenu isActive={isMenuActive} />
        </View>
    );
}

VideoPlayer.propTypes = propTypes;
VideoPlayer.defaultProps = defaultProps;
VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
