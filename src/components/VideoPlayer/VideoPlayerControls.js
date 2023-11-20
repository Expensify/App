import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import * as Expensicons from '@components/Icon/Expensicons';
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
    // eslint-disable-next-line react/forbid-prop-types
    duration: PropTypes.number.isRequired,

    position: PropTypes.number.isRequired,

    url: PropTypes.string.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    videoPlayerRef: PropTypes.object.isRequired,
};

const defaultProps = {};

function VideoPlayerControls({duration, position, url, videoPlayerRef}) {
    const {translate} = useLocalize();
    const {togglePlay, isPlaying, currentlyPlayingURL, updateCurrentlyPlayingURL} = usePlaybackContext();
    const {showPopover} = useVideoPopoverMenuContext();
    const [durationFormatted, setDurationFormatted] = useState('0:00');
    const [shouldShowTime, setShouldShowTime] = useState(false);

    const isCurrentlySet = currentlyPlayingURL === url;
    const isCurrentlyPlaying = isCurrentlySet && isPlaying;

    const togglePlayCurrentVideo = useCallback(() => {
        if (!isCurrentlySet) {
            updateCurrentlyPlayingURL(url);
        } else {
            togglePlay();
        }
    }, [isCurrentlySet, togglePlay, updateCurrentlyPlayingURL, url]);

    const onLayout = (e) => {
        setShouldShowTime(e.nativeEvent.layout.width > 250);
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
            style={[styles.videoPlayerControlsContainer]}
            onLayout={onLayout}
        >
            <View style={[styles.videoPlayerControlsButtonContainer]}>
                <View style={[styles.videoPlayerControlsRow]}>
                    <IconButton
                        src={isCurrentlyPlaying ? Expensicons.Pause : Expensicons.Play}
                        accessibilityLabel={translate('videoPlayer.tooglePlay')}
                        onPress={togglePlayCurrentVideo}
                        style={spacing.mr2}
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
                    <VolumeButton style={spacing.mr3} />
                    <IconButton
                        src={Expensicons.Fullscreen}
                        accessibilityLabel={translate('videoPlayer.enterFullScreen')}
                        onPress={enterFullScreenMode}
                        style={spacing.mr3}
                    />
                    <IconButton
                        src={Expensicons.ThreeDots}
                        accessibilityLabel={translate('videoPlayer.moreOptions')}
                        onPress={(e) => showPopover(e.nativeEvent.pageY + CONST.VIDEO_PLAYER.POPOVER_Y_OFFSET, e.nativeEvent.pageX)}
                    />
                </View>
            </View>
            <View style={[styles.videoPlayerControlsRow, spacing.mh1]}>
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
