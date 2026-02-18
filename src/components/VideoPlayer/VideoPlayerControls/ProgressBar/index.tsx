import React, {useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {Platform} from 'react-native';
import type {GestureStateChangeEvent, GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';
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
    const {pauseVideo, playVideo, checkIfVideoIsPlaying} = usePlaybackActionsContext();
    const [sliderWidth, setSliderWidth] = useState(1);
    const [isSliderPressed, setIsSliderPressed] = useState(false);
    const progressWidth = useSharedValue(0);
    const wasVideoPlayingOnCheck = useSharedValue(false);
    const sliderLeftOffset = useSharedValue(0);
    const currentProgressPosition = useSharedValue(0);

    const onCheckIfVideoIsPlaying = (isPlaying: boolean) => {
        wasVideoPlayingOnCheck.set(isPlaying);
    };

    const updateProgressBar = (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload> | GestureStateChangeEvent<PanGestureHandlerEventPayload>, isInitialTouch = false) => {
        let relativeX: number;
        
        if (isInitialTouch) {
            // On initial touch, use absoluteX to allow clicking/tapping anywhere on the bar (like YouTube)
            relativeX = event.absoluteX - sliderLeftOffset.get();
            currentProgressPosition.set(relativeX);
        } else {
            // While dragging, use the accumulated position to ensure smooth dragging
            relativeX = currentProgressPosition.get();
        }
        
        const progress = getProgress(relativeX, sliderWidth);
        progressWidth.set(progress);
        return progress;
    };

    const onSliderLayout = (event: LayoutChangeEvent) => {
        setSliderWidth(event.nativeEvent.layout.width);
    };

    const pan = Gesture.Pan()
        // Activate immediately on touch so the gesture captures the touch on Android and the parent
        // Pressable does not receive it (which would toggle controls and hide the progress bar).
        .minDistance(0)
        .runOnJS(true)
        // Prevent the gesture from being cancelled when moving outside the view bounds
        .shouldCancelWhenOutside(false)
        .onBegin((event) => {
            setIsSliderPressed(true);
            checkIfVideoIsPlaying(onCheckIfVideoIsPlaying);
            pauseVideo();
            // Store the absolute position of the progress bar on first touch
            sliderLeftOffset.set(event.absoluteX - event.x);
            // Just update the progress bar visual, don't seek yet
            updateProgressBar(event, true);
        })
        .onChange((event) => {
            // Update position based on drag movement
            currentProgressPosition.set((value) => value + event.changeX);
            // Just update the progress bar visual while dragging, don't seek yet
            updateProgressBar(event, false);
        })
        .onFinalize(() => {
            setIsSliderPressed(false);
            // Seek to the final position when user releases (like YouTube)
            const finalProgress = progressWidth.get();
            scheduleOnRN(seekPosition, (finalProgress * duration) / 100);
            // Resume playing if video was playing before
            if (!wasVideoPlayingOnCheck.get()) {
                return;
            }
            playVideo();
        });

    // Wrap pan gesture in Exclusive to block touch events from reaching parent Pressable
    const gesture = Gesture.Exclusive(pan);

    useEffect(() => {
        if (isSliderPressed) {
            return;
        }
        progressWidth.set(getProgress(position, duration));
    }, [duration, isSliderPressed, position, progressWidth]);

    const progressBarStyle = useAnimatedStyle(() => ({width: `${progressWidth.get()}%`}));

    // On Android, use a larger minimum touch target so the progress bar is easier to hit and the
    // gesture reliably captures the touch instead of the parent Pressable (which would hide controls).
    const progressBarTouchStyle = Platform.OS === 'android' ? {minHeight: 44} : undefined;

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.w100, styles.h100, styles.pv2, styles.cursorPointer, styles.flex1, styles.justifyContentCenter, progressBarTouchStyle]}>
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
