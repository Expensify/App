import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
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

function getProgress(currentPosition, maxPosition) {
    return Math.min(Math.max((currentPosition / maxPosition) * 100, 0), 100);
}

function ProgressBar({duration, position, seekPosition}) {
    const styles = useThemeStyles();
    const {pauseVideo, playVideo, checkVideoPlaying} = usePlaybackContext();
    const [sliderWidth, setSliderWidth] = useState(1);
    const [isSliderPressed, setIsSliderPressed] = useState(false);
    const progressWidth = useSharedValue(0);
    const wasVideoPlayingOnCheck = useSharedValue(false);

    const onCheckVideoPlaying = (isPlaying) => {
        wasVideoPlayingOnCheck.value = isPlaying;
    };

    const progressBarInteraction = (event) => {
        const progress = getProgress(event.x, sliderWidth);
        progressWidth.value = progress;
        runOnJS(seekPosition)((progress * duration) / 100);
    };

    const onSliderLayout = (e) => {
        setSliderWidth(e.nativeEvent.layout.width);
    };

    const pan = Gesture.Pan()
        .onBegin((event) => {
            runOnJS(setIsSliderPressed)(true);
            runOnJS(checkVideoPlaying)(onCheckVideoPlaying);
            runOnJS(pauseVideo)();
            runOnJS(progressBarInteraction)(event);
        })
        .onChange((event) => {
            runOnJS(progressBarInteraction)(event);
        })
        .onFinalize(() => {
            runOnJS(setIsSliderPressed)(false);
            if (!wasVideoPlayingOnCheck.value) {
                return;
            }
            runOnJS(playVideo)();
        });

    useEffect(() => {
        if (isSliderPressed) {
            return;
        }
        progressWidth.value = getProgress(position, duration);
    }, [duration, isSliderPressed, position, progressWidth]);

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
