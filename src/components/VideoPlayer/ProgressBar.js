import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import styles from '@styles/styles';
import spacing from '@styles/utilities/spacing';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    duration: PropTypes.number.isRequired,

    position: PropTypes.number.isRequired,

    seekPosition: PropTypes.func.isRequired,

    togglePlayCurrentVideo: PropTypes.func.isRequired,
};

const defaultProps = {};

function ProgressBar({togglePlayCurrentVideo, duration, position, seekPosition}) {
    const {pauseVideo} = usePlaybackContext();
    const [sliderWidth, setSliderWidth] = useState(1);
    const progressWidth = useSharedValue(0);

    const onSliderLayout = (e) => {
        setSliderWidth(e.nativeEvent.layout.width);
    };

    const pan = Gesture.Pan()
        .onBegin(() => {
            runOnJS(pauseVideo)();
        })
        .onChange((event) => {
            progressWidth.value = (event.x / sliderWidth) * 100;
            runOnJS(seekPosition)((event.x / sliderWidth) * duration);
        })
        .onEnd(() => {
            runOnJS(togglePlayCurrentVideo)();
        });

    useEffect(() => {
        progressWidth.value = (position / duration) * 100;
    }, [duration, position, progressWidth]);

    const progressBarStyle = useAnimatedStyle(() => ({width: `${progressWidth.value}%`}));

    return (
        <GestureDetector gesture={pan}>
            <View style={[styles.w100, styles.h100, spacing.pv2]}>
                <View
                    style={[styles.progressBarOutline]}
                    onLayout={onSliderLayout}
                >
                    <Animated.View style={[styles.progressBarFill, progressBarStyle]} />
                </View>
            </View>
        </GestureDetector>
    );
}

ProgressBar.propTypes = propTypes;
ProgressBar.defaultProps = defaultProps;
ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
