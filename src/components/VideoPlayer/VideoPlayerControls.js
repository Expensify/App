import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import * as Expensicons from '@components/Icon/Expensicons';
import refPropTypes from '@components/refPropTypes';
import Text from '@components/Text';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import VolumeButton from '@components/VolumeButton';
import useLocalize from '@hooks/useLocalize';
import styles from '@styles/styles';
import spacing from '@styles/utilities/spacing';
import CONST from '@src/CONST';
import IconButton from './IconButton';
import ProgressBar from './ProgressBar';
import convertMillisecondsToTime from './utils';

const propTypes = {
    duration: PropTypes.number.isRequired,

    position: PropTypes.number.isRequired,

    url: PropTypes.string.isRequired,

    videoPlayerRef: refPropTypes.isRequired,

    isPlaying: PropTypes.bool.isRequired,

    // Defines if component should have small icons and tighter spacing inline
    small: PropTypes.bool,
};

const defaultProps = {
    small: false,
};

function VideoPlayerControls({duration, position, url, videoPlayerRef, isPlaying, small}) {
    const {translate} = useLocalize();
    const {togglePlay, currentlyPlayingURL, updateCurrentlyPlayingURL} = usePlaybackContext();
    const {showPopover} = useVideoPopoverMenuContext();
    const [durationFormatted, setDurationFormatted] = useState('0:00');
    const [shouldShowTime, setShouldShowTime] = useState(false);
    const isCurrentlyURLSet = currentlyPlayingURL === url;
    const iconSpacing = small ? spacing.mr3 : spacing.mr4;

    const togglePlayCurrentVideo = useCallback(() => {
        if (!isCurrentlyURLSet) {
            updateCurrentlyPlayingURL(url);
        } else {
            togglePlay();
        }
    }, [isCurrentlyURLSet, togglePlay, updateCurrentlyPlayingURL, url]);

    const onLayout = (e) => {
        setShouldShowTime(e.nativeEvent.layout.width > CONST.VIDEO_PLAYER.HIDE_TIME_TEXT_WIDTH);
    };

    const enterFullScreenMode = useCallback(() => {
        updateCurrentlyPlayingURL(url);
        videoPlayerRef.current.presentFullscreenPlayer();
    }, [updateCurrentlyPlayingURL, url, videoPlayerRef]);

    const seekPosition = useCallback(
        (newPosition) => {
            videoPlayerRef.current.setStatusAsync({positionMillis: newPosition});
        },
        [videoPlayerRef],
    );

    useEffect(() => {
        setDurationFormatted(convertMillisecondsToTime(duration));
    }, [duration]);

    return (
        <Animated.View
            style={[styles.videoPlayerControlsContainer, small ? [spacing.p2, spacing.pb0] : [spacing.p3, spacing.pb1]]}
            onLayout={onLayout}
        >
            <View style={[styles.videoPlayerControlsButtonContainer, !small && spacing.mb4]}>
                <View style={[styles.videoPlayerControlsRow]}>
                    <IconButton
                        src={isPlaying ? Expensicons.Pause : Expensicons.Play}
                        tooltipText={isPlaying ? translate('videoPlayer.pause') : translate('videoPlayer.play')}
                        onPress={togglePlayCurrentVideo}
                        style={spacing.mr2}
                        small={small}
                    />
                    {shouldShowTime && (
                        <View style={[styles.videoPlayerControlsRow]}>
                            <Text style={[styles.videoPlayerText, styles.videoPlayerTimeComponentWidth]}>{convertMillisecondsToTime(position)}</Text>
                            <Text style={[styles.videoPlayerText]}>/</Text>
                            <Text style={[styles.videoPlayerText, styles.videoPlayerTimeComponentWidth]}>{durationFormatted}</Text>
                        </View>
                    )}
                </View>
                <View style={[styles.videoPlayerControlsRow]}>
                    <VolumeButton style={iconSpacing} />
                    <IconButton
                        src={Expensicons.Fullscreen}
                        tooltipText={translate('videoPlayer.fullscreen')}
                        onPress={enterFullScreenMode}
                        style={iconSpacing}
                        small={small}
                    />
                    <IconButton
                        src={Expensicons.ThreeDots}
                        tooltipText={translate('common.more')}
                        onPress={(e) => showPopover(e.nativeEvent.pageY + CONST.VIDEO_PLAYER.POPOVER_Y_OFFSET, e.nativeEvent.pageX)}
                        small={small}
                    />
                </View>
            </View>
            <View style={[styles.videoPlayerControlsRow]}>
                <ProgressBar
                    duration={duration}
                    position={position}
                    seekPosition={seekPosition}
                    togglePlayCurrentVideo={togglePlayCurrentVideo}
                />
            </View>
        </Animated.View>
    );
}

VideoPlayerControls.propTypes = propTypes;
VideoPlayerControls.defaultProps = defaultProps;
VideoPlayerControls.displayName = 'VideoPlayerControls';

export default VideoPlayerControls;
