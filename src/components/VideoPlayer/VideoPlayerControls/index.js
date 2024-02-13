import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import * as Expensicons from '@components/Icon/Expensicons';
import refPropTypes from '@components/refPropTypes';
import Text from '@components/Text';
import IconButton from '@components/VideoPlayer/IconButton';
import convertMillisecondsToTime from '@components/VideoPlayer/utils';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import stylePropTypes from '@styles/stylePropTypes';
import CONST from '@src/CONST';
import ProgressBar from './ProgressBar';
import VolumeButton from './VolumeButton';

const propTypes = {
    duration: PropTypes.number.isRequired,

    position: PropTypes.number.isRequired,

    url: PropTypes.string.isRequired,

    videoPlayerRef: refPropTypes.isRequired,

    isPlaying: PropTypes.bool.isRequired,

    // Defines if component should have small icons and tighter spacing inline
    small: PropTypes.bool,

    style: stylePropTypes,

    showPopoverMenu: PropTypes.func.isRequired,

    togglePlayCurrentVideo: PropTypes.func.isRequired,
};

const defaultProps = {
    small: false,
    style: undefined,
};

function VideoPlayerControls({duration, position, url, videoPlayerRef, isPlaying, small, style, showPopoverMenu, togglePlayCurrentVideo}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {updateCurrentlyPlayingURL} = usePlaybackContext();
    const [shouldShowTime, setShouldShowTime] = useState(false);
    const iconSpacing = small ? styles.mr3 : styles.mr4;

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

    const durationFormatted = useMemo(() => convertMillisecondsToTime(duration), [duration]);

    return (
        <Animated.View
            style={[styles.videoPlayerControlsContainer, small ? [styles.p2, styles.pb0] : [styles.p3, styles.pb1], style]}
            onLayout={onLayout}
        >
            <View style={[styles.videoPlayerControlsButtonContainer, !small && styles.mb4]}>
                <View style={[styles.videoPlayerControlsRow]}>
                    <IconButton
                        src={isPlaying ? Expensicons.Pause : Expensicons.Play}
                        tooltipText={isPlaying ? translate('videoPlayer.pause') : translate('videoPlayer.play')}
                        onPress={togglePlayCurrentVideo}
                        style={styles.mr2}
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
                        onPress={showPopoverMenu}
                        small={small}
                    />
                </View>
            </View>
            <View style={styles.videoPlayerControlsRow}>
                <ProgressBar
                    duration={duration}
                    position={position}
                    seekPosition={seekPosition}
                />
            </View>
        </Animated.View>
    );
}

VideoPlayerControls.propTypes = propTypes;
VideoPlayerControls.defaultProps = defaultProps;
VideoPlayerControls.displayName = 'VideoPlayerControls';

export default VideoPlayerControls;
