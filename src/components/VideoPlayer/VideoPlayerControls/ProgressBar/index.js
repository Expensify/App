import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useThemeStyles from '@hooks/useThemeStyles';

const propTypes = {
    duration: PropTypes.number.isRequired,

    position: PropTypes.number.isRequired,

    seekPosition: PropTypes.func.isRequired,
};

const defaultProps = {};

function ProgressBar({duration, position, seekPosition}) {
    const styles = useThemeStyles();
    const {pauseVideo, playVideo, checkVideoPlaying} = usePlaybackContext();
    const [sliderWidth, setSliderWidth] = useState(1);
    const progressWidth = useSharedValue(0);
    const wasVideoPlayingOnCheck = useSharedValue(false);

    const onCheckVideoPlaying = (isPlaying) => {
        wasVideoPlayingOnCheck.value = isPlaying;
    };

    const progressBarInteraction = (event) => {
        progressWidth.value = (event.x / sliderWidth) * 100;
        runOnJS(seekPosition)((event.x / sliderWidth) * duration);
    };

    const onSliderLayout = (e) => {
        setSliderWidth(e.nativeEvent.layout.width);
    };

    const pan = Gesture.Pan()
        .onBegin((event) => {
            runOnJS(checkVideoPlaying)(onCheckVideoPlaying);
            runOnJS(pauseVideo)();
            runOnJS(progressBarInteraction)(event);
        })
        .onChange((event) => {
            runOnJS(progressBarInteraction)(event);
        })
        .onFinalize(() => {
            if (!wasVideoPlayingOnCheck.value) {
                return;
            }
            runOnJS(playVideo)();
        });

    useEffect(() => {
        progressWidth.value = (position / duration) * 100;
    }, [duration, position, progressWidth]);

    const progressBarStyle = useAnimatedStyle(() => ({width: `${progressWidth.value}%`}));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={[styles.w100, styles.h100, styles.pv2, styles.cursorPointer]}>
                <Animated.View
                    style={styles.progressBarOutline}
                    onLayout={onSliderLayout}
                >
                    <Animated.View
                        style={styles.progressBarFill}
                        animatedProps={progressBarStyle}
                    />
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

ProgressBar.propTypes = propTypes;
ProgressBar.defaultProps = defaultProps;
ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
