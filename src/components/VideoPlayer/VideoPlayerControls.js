import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import VolumeButton from '@components/VolumeButton';
import IconButton from './IconButton';
import ProgressBar from './ProgressBar';
import convertMillisecondsToTime from './utils';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    duration: PropTypes.number.isRequired,

    position: PropTypes.number.isRequired,

    url: PropTypes.string.isRequired,
};

const defaultProps = {};

function VideoPlayerControls({duration, position, url}) {
    const {togglePlay, isPlaying, seekPosition, enterFullScreenMode, currentlyPlayingURL, updateCurrentlyPlayingURL} = usePlaybackContext();
    const {showPopover} = useVideoPopoverMenuContext();
    const [durationFormatted, setDurationFormatted] = useState('0:00');

    const isCurrentlySet = currentlyPlayingURL === url;
    const isCurrentlyPlaying = isCurrentlySet && isPlaying;

    useEffect(() => {
        setDurationFormatted(convertMillisecondsToTime(duration));
    }, [duration]);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
                backgroundColor: '#061B09CC',
                height: 60,
                borderRadius: 10,
                flexDirection: 'column',
                overflow: 'visible',
                padding: 10,
            }}
            entering={FadeIn.duration(3000)}
            exiting={FadeOut.duration(3000)}
        >
            <View style={{flex: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <IconButton
                        src={isCurrentlyPlaying ? Expensicons.Pause : Expensicons.Play}
                        fill="white"
                        accessibilityLabel="play/pause"
                        onPress={() => {
                            if (!isCurrentlySet) {
                                updateCurrentlyPlayingURL(url);
                            } else {
                                togglePlay();
                            }
                        }}
                    />
                    <Text style={{color: 'white', width: 35, textAlign: 'center'}}>{convertMillisecondsToTime(position)}</Text>
                    <Text style={{color: 'white'}}>/</Text>
                    <Text style={{color: 'white', width: 35, textAlign: 'center'}}>{durationFormatted}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <VolumeButton style={{marginRight: 10}} />
                    <IconButton
                        src={Expensicons.Fullscreen}
                        fill="white"
                        accessibilityLabel="fullsreen"
                        onPress={enterFullScreenMode}
                        style={{marginRight: 10}}
                    />
                    <IconButton
                        src={Expensicons.ThreeDots}
                        fill="white"
                        accessibilityLabel="More options"
                        onPress={(e) => showPopover(e.nativeEvent.pageY - 30, e.nativeEvent.pageX)}
                    />
                </View>
            </View>
            <View style={{flex: 2, flexDirection: 'row'}}>
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
