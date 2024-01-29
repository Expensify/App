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

    togglePlayCurrentVideo: PropTypes.func.isRequired,
};

const defaultProps = {};

function ProgressBar({togglePlayCurrentVideo, duration, position, seekPosition}) {
    const styles = useThemeStyles();
    const {pauseVideo} = usePlaybackContext();
    const [sliderWidth, setSliderWidth] = useState(1);
    const progressWidth = useSharedValue(0);

    const onSliderLayout = (e) => {
        setSliderWidth(e.nativeEvent.layout.width);
    };

    const tap = Gesture.Tap()
        .onBegin((event) => {
            runOnJS(pauseVideo)();
            progressWidth.value = (event.x / sliderWidth) * 100;
            runOnJS(seekPosition)((event.x / sliderWidth) * duration);
        })
        .onEnd(() => {
            runOnJS(togglePlayCurrentVideo)();
        });

    const longPress = Gesture.LongPress()
        .onBegin((event) => {
            runOnJS(pauseVideo)();
            progressWidth.value = (event.x / sliderWidth) * 100;
            runOnJS(seekPosition)((event.x / sliderWidth) * duration);
        })
        .onEnd(() => {
            runOnJS(togglePlayCurrentVideo)();
        });

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

    const composed = Gesture.Race(tap, longPress, pan);

    useEffect(() => {
        progressWidth.value = (position / duration) * 100;
    }, [duration, position, progressWidth]);

    const progressBarStyle = useAnimatedStyle(() => ({width: `${progressWidth.value}%`}));

    return (
        <GestureDetector gesture={composed}>
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
