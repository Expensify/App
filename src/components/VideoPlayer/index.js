import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {Video, ResizeMode} from 'expo-av';
import _ from 'underscore';
import styles from '../../styles/styles';
import {usePlaybackContext} from '../PlaybackContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import VideoPlayerControls from './VideoPlayerControls';
import PopoverMenu from '../PopoverMenu';
import * as Expensicons from '../Icon/Expensicons';
import fileDownload from '../../libs/fileDownload';

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
    const {updateCurrentlyPlayingURL, currentlyPlayingURL, updateSharedElements, currentVideoPLayerRef, sharedElement, originalParent} = usePlaybackContext();
    const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
    const [duration, setDuration] = React.useState(0);
    const [position, setPosition] = React.useState(0);

    const [isPlaybackMenuActive, setIsPlaybackMenuActive] = React.useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = React.useState({vertical: 0, horizontal: 0});

    const [isCreateMenuActive, setIsCreateMenuActive] = React.useState(false);
    const ref = useRef(null);
    currentVideoPLayerRef.current = ref.current;

    const videoPlayerParentRef = useRef(null);
    const videoPlayerRef = useRef(null);

    const togglePlay = () => {
        updateCurrentlyPlayingURL(url);
        ref.current.setStatusAsync({shouldPlay: !isVideoPlaying});
        setIsVideoPlaying(!isVideoPlaying);
    };

    const showCreateMenu = () => {
        setIsCreateMenuActive(true);
    };
    const hideCreateMenu = () => {
        setIsCreateMenuActive(false);
    };
    const toggleCreateMenu = (e) => {
        if (isCreateMenuActive) {
            hideCreateMenu();
        } else {
            setPopoverAnchorPosition({vertical: e.nativeEvent.pageY, horizontal: e.nativeEvent.pageX});
            showCreateMenu();
        }
    };

    const menuItems = [
        {
            icon: Expensicons.Download,
            text: 'Download',
            onSelected: () => {
                console.log('Download');
                fileDownload(url);
                hideCreateMenu();
            },
        },
        {
            icon: Expensicons.Meter,
            text: 'Playback speed',
            onSelected: () => {
                console.log('Playback speed');
                setIsPlaybackMenuActive(true);
            },
            shouldShowRightIcon: true,
        },
    ];

    // shared element transition logic for video player
    useEffect(() => {
        if (!shouldUseSharedVideoElement) {
            return;
        }
        const reff = videoPlayerParentRef.current;
        if (currentlyPlayingURL === url) {
            reff.appendChild(sharedElement);
        }
        return () => {
            if (!reff.childNodes[0]) {
                return;
            }
            originalParent.appendChild(sharedElement);
        };
    }, [currentlyPlayingURL, isSmallScreenWidth, originalParent, sharedElement, shouldUseSharedVideoElement, url]);

    useEffect(() => {
        if (shouldUseSharedVideoElement && url !== currentlyPlayingURL) {
            return;
        }
        updateSharedElements(videoPlayerParentRef.current, videoPlayerRef.current);
    }, [currentlyPlayingURL, shouldUseSharedVideoElement, updateSharedElements, url]);

    return (
        <View style={[styles.w100, styles.h100]}>
            {shouldUseSharedVideoElement ? (
                <View
                    ref={videoPlayerParentRef}
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
                                setIsVideoLoading(false);
                                onVideoLoaded(e);
                            }}
                            onLoadStart={() => setIsVideoLoading(true)}
                            onPlaybackStatusUpdate={(e) => {
                                const videoDuration = e.durationMillis;
                                if (videoDuration > 0 && !_.isNaN(videoDuration)) {
                                    setDuration(videoDuration);
                                }
                                setPosition(e.positionMillis);
                            }}
                        />
                    </View>
                </View>
            )}

            {/* {isVideoLoading && <FullScreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />} */}

            {/* {((!isVideoLoading && (isHovered || isSmallScreenWidth)) || isCreateMenuActive) && ( */}
            <VideoPlayerControls
                duration={duration}
                position={position}
                toggleCreateMenu={toggleCreateMenu}
            />
            {/* )} */}

            <PopoverMenu
                onClose={hideCreateMenu}
                onItemSelected={hideCreateMenu}
                isVisible={isCreateMenuActive}
                anchorPosition={popoverAnchorPosition}
                fromSidebarMediumScreen={!isSmallScreenWidth}
                menuItems={menuItems}
                withoutOverlay
            />
        </View>
    );
}

VideoPlayer.propTypes = propTypes;
VideoPlayer.defaultProps = defaultProps;
VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
