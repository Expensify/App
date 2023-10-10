import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {Video, ResizeMode} from 'expo-av';
import _ from 'underscore';
import styles from '../../styles/styles';
import Hoverable from '../Hoverable';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
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
};

const defaultProps = {
    shouldPlay: false,
    onVideoLoaded: () => {},
    resizeMode: ResizeMode.CONTAIN,
    isLooping: false,
    style: [styles.w100, styles.h100],
    videoStyle: [styles.w100, styles.h100],
};

function VideoPlayer({url, resizeMode, shouldPlay, onVideoLoaded, isLooping, style, videoStyle}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {updateCurrentlyPlayingURL, volume} = usePlaybackContext();
    const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
    const [isVideoLoading, setIsVideoLoading] = React.useState(true);
    const [duration, setDuration] = React.useState(0);
    const [position, setPosition] = React.useState(0);

    const [isPlaybackMenuActive, setIsPlaybackMenuActive] = React.useState(false);

    const [isCreateMenuActive, setIsCreateMenuActive] = React.useState(false);
    const anchorRef = React.useRef(null);
    const ref = useRef(null);

    const togglePlay = () => {
        updateCurrentlyPlayingURL(url);
        ref.current.setStatusAsync({shouldPlay: !isVideoPlaying});
        setIsVideoPlaying(!isVideoPlaying);
    };

    const updatePostiion = (newPosition) => {
        ref.current.setStatusAsync({positionMillis: newPosition});
    };

    const enterFullScreenMode = () => {
        ref.current.presentFullscreenPlayer();
    };

    const updateVolume = (newVolume) => {
        ref.current.setStatusAsync({volume: newVolume});
    };
    const showCreateMenu = () => {
        setIsCreateMenuActive(true);
    };
    const hideCreateMenu = () => {
        setIsCreateMenuActive(false);
    };
    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
        } else {
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

    const playbackSpeedMenuItems = [
        {
            icon: Expensicons.Download,
            text: 'TEST',
            onSelected: () => {
                console.log('Download');

                hideCreateMenu();
            },
        },
    ];

    useEffect(() => {
        updateVolume(volume);
    }, [volume]);

    return (
        <Hoverable>
            {(isHovered) => (
                <View
                    style={[styles.w100, styles.h100]}
                    ref={anchorRef}
                >
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

                    {isVideoLoading && <FullScreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}

                    {((!isVideoLoading && (isHovered || isSmallScreenWidth)) || isCreateMenuActive) && (
                        <VideoPlayerControls
                            duration={duration}
                            position={position}
                            togglePlay={togglePlay}
                            updatePostiion={updatePostiion}
                            enterFullScreenMode={enterFullScreenMode}
                            isPlaying={isVideoPlaying}
                            toggleCreateMenu={toggleCreateMenu}
                        />
                    )}

                    <PopoverMenu
                        onClose={hideCreateMenu}
                        onItemSelected={hideCreateMenu}
                        isVisible={isCreateMenuActive}
                        anchorPosition={{horizontal: 0, vertical: 0}}
                        fromSidebarMediumScreen={!isSmallScreenWidth}
                        menuItems={menuItems}
                        withoutOverlay
                        anchorRef={anchorRef}
                    />
                </View>
            )}
        </Hoverable>
    );
}

VideoPlayer.propTypes = propTypes;
VideoPlayer.defaultProps = defaultProps;
VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
