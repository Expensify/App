import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {Video, ResizeMode} from 'expo-av';
import _ from 'underscore';
import styles from '../../styles/styles';
import {usePlaybackContext} from '../VideoPlayerContexts/PlaybackContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import VideoPlayerControls from './VideoPlayerControls';
import addEncryptedAuthTokenToURL from '../../libs/addEncryptedAuthTokenToURL';

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
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const videoPlayerRef = useRef(null);
    const videoPlayerElementParentRef = useRef(null);
    const videoPlayerElementRef = useRef(null);
    const sharedVideoPlayerParentRef = useRef(null);
    const sourceURLWithAuth = addEncryptedAuthTokenToURL(url);

    const onReadyForDisplay = useCallback(
        (e) => {
            if (!isVideoLoading) {
                return;
            }
            setIsVideoLoading(false);
            onVideoLoaded(e);
        },
        [isVideoLoading, onVideoLoaded],
    );

    const onPlaybackStatusUpdate = useCallback(
        (e) => {
            if (!isPlaying) {
                return;
            }
            updateDuration(e.durationMillis || 0);
            updatePosition(e.positionMillis || 0);
        },
        [isPlaying, updateDuration, updatePosition],
    );

    // update shared video elements
    useEffect(() => {
        if (shouldUseSharedVideoElement || url !== currentlyPlayingURL) {
            return;
        }
        updateSharedElements(videoPlayerElementParentRef.current, videoPlayerElementRef.current);
        updateCurrentVideoPlayerRef(videoPlayerRef.current);
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, updateCurrentVideoPlayerRef, updateSharedElements, url]);

    // append shared video element to new parent (used for example in attachment modal)
    useEffect(() => {
        if (!sharedElement || !shouldUseSharedVideoElement) {
            return;
        }

        const newParentRef = sharedVideoPlayerParentRef.current;
        if (currentlyPlayingURL === url) {
            newParentRef.appendChild(sharedElement);
        }
        return () => {
            if (!originalParent && !newParentRef.childNodes[0]) {
                return;
            }
            originalParent.appendChild(sharedElement);
        };
    }, [currentlyPlayingURL, isSmallScreenWidth, originalParent, sharedElement, shouldUseSharedVideoElement, url]);

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
                        videoPlayerElementParentRef.current = el;
                        if (el.childNodes[0]) {
                            videoPlayerElementRef.current = el.childNodes[0];
                        }
                    }}
                >
                    <View style={styles.flex1}>
                        <Video
                            ref={videoPlayerRef}
                            style={style}
                            videoStyle={videoStyle}
                            source={{
                                uri: sourceURLWithAuth || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                            }}
                            shouldPlay={shouldPlay}
                            useNativeControls={false}
                            resizeMode={resizeMode}
                            isLooping={isLooping}
                            onReadyForDisplay={onReadyForDisplay}
                            onLoadStart={() => setIsVideoLoading(true)}
                            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                        />
                    </View>
                </View>
            )}

            <VideoPlayerControls
                duration={duration}
                position={position}
                url={url}
            />
        </View>
    );
}

VideoPlayer.propTypes = propTypes;
VideoPlayer.defaultProps = defaultProps;
VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
