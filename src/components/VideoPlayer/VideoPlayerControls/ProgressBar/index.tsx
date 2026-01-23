import React, {useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import type {GestureStateChangeEvent, GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useThemeStyles from '@hooks/useThemeStyles';

type ProgressBarProps = {
    /** Total duration of a video. */
    duration: number;

    /** Position of progress pointer on the bar. */
    position: number;

    /** Function to seek to a specific position in the video. */
    seekPosition: (newPosition: number) => void;
};

function getProgress(currentPosition: number, maxPosition: number): number {
    return Math.min(Math.max((currentPosition / maxPosition) * 100, 0), 100);
}

function ProgressBar({duration, position, seekPosition}: ProgressBarProps) {
    const styles = useThemeStyles();
    const {pauseVideo, playVideo, checkIfVideoIsPlaying} = usePlaybackContext();
    const [sliderWidth, setSliderWidth] = useState(1);
    const [isSliderPressed, setIsSliderPressed] = useState(false);
    const progressWidth = useSharedValue(0);
    const wasVideoPlayingOnCheck = useSharedValue(false);

    const onCheckIfVideoIsPlaying = (isPlaying: boolean) => {
        wasVideoPlayingOnCheck.set(isPlaying);
    };

    const progressBarInteraction = (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload> | GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        const progress = getProgress(event.x, sliderWidth);
        progressWidth.set(progress);
        scheduleOnRN(seekPosition, (progress * duration) / 100);
    };

    const onSliderLayout = (event: LayoutChangeEvent) => {
        setSliderWidth(event.nativeEvent.layout.width);
    };

    const pan = Gesture.Pan()
        .runOnJS(true)
        .onBegin((event) => {
            setIsSliderPressed(true);
            checkIfVideoIsPlaying(onCheckIfVideoIsPlaying);
            pauseVideo();
            progressBarInteraction(event);
        })
        .onChange((event) => {
            progressBarInteraction(event);
        })
        .onFinalize(() => {
            setIsSliderPressed(false);
            if (!wasVideoPlayingOnCheck.get()) {
                return;
            }
            playVideo();
        });

    useEffect(() => {
        if (isSliderPressed) {
            return;
        }
        progressWidth.set(getProgress(position, duration));
    }, [duration, isSliderPressed, position, progressWidth]);

    const progressBarStyle = useAnimatedStyle(() => ({width: `${progressWidth.get()}%`}));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={[styles.w100, styles.h100, styles.pv2, styles.cursorPointer, styles.flex1, styles.justifyContentCenter]}>
                <Animated.View
                    style={styles.progressBarOutline}
                    onLayout={onSliderLayout}
                >
                    <Animated.View style={[styles.progressBarFill, progressBarStyle]} />
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

export default ProgressBar;
