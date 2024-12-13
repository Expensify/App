import {useCallback, useEffect, useState} from 'react';
import type {ViewStyle} from 'react-native';
import {runOnJS, useAnimatedStyle, withDelay, withTiming} from 'react-native-reanimated';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type UseButtonAnimationProps = {
    isRunning: boolean;
    onFinish: () => void;
    buttonInitialScale?: number;
    buttonTargetScale?: number;
    buttonInitialOpacity?: number;
    buttonTargetOpacity?: number;
    containerInitialHeight?: number;
    containerTargetHeight?: number;
    containerInitialMarginTop?: number;
    containerTargetMarginTop?: number;
    textInitialScale?: number;
    textTargetScale?: number;
    textInitialOpacity?: number;
    textTargetOpacity?: number;
    delay?: number;
    duration?: number;
};

type UseButtonAnimationReturn = {
    animatedButtonStyles: ViewStyle;
    animatedContainerStyles: ViewStyle;
    animatedTextStyles: ViewStyle;
    resetAnimation: () => void;
};

const useButtonAnimation = ({
    isRunning,
    onFinish,
    buttonInitialScale = 1,
    buttonTargetScale = 0,
    buttonInitialOpacity = 1,
    buttonTargetOpacity = 0,
    containerInitialHeight = variables.componentSizeNormal,
    containerTargetHeight = 0,
    containerInitialMarginTop = 10,
    containerTargetMarginTop = 0,
    textInitialScale = 0,
    textTargetScale = 1,
    textInitialOpacity = 1,
    textTargetOpacity = 0,
    delay = CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY,
    duration = CONST.ANIMATION_PAID_DURATION,
}: UseButtonAnimationProps): UseButtonAnimationReturn => {
    // Replace useSharedValue with useState
    const [buttonScale, setButtonScale] = useState(buttonInitialScale);
    const [buttonOpacity, setButtonOpacity] = useState(buttonInitialOpacity);
    const [containerHeight, setContainerHeight] = useState(containerInitialHeight);
    const [containerMarginTop, setContainerMarginTop] = useState(containerInitialMarginTop);
    const [textScale, setTextScale] = useState(textInitialScale);
    const [textOpacity, setTextOpacity] = useState(textInitialOpacity);

    const animatedButtonStyles = useAnimatedStyle(() => ({
        transform: [{scale: buttonScale}],
        opacity: buttonOpacity,
    }));

    const animatedContainerStyles = useAnimatedStyle(() => ({
        height: containerHeight,
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: containerMarginTop,
    }));

    const animatedTextStyles = useAnimatedStyle(() => ({
        transform: [{scale: textScale}],
        opacity: textOpacity,
        position: 'absolute',
        alignSelf: 'center',
    }));

    const resetAnimation = useCallback(() => {
        setButtonScale(buttonInitialScale);
        setButtonOpacity(buttonInitialOpacity);
        setContainerHeight(containerInitialHeight);
        setContainerMarginTop(containerInitialMarginTop);
        setTextScale(textInitialScale);
        setTextOpacity(textInitialOpacity);
    }, [buttonInitialScale, buttonInitialOpacity, containerInitialHeight, containerInitialMarginTop, textInitialScale, textInitialOpacity]);

    useEffect(() => {
        if (isRunning) {
            setButtonScale(withTiming(buttonTargetScale, {duration}));
            setButtonOpacity(withTiming(buttonTargetOpacity, {duration}));
            setTextScale(withTiming(textTargetScale, {duration}));
            setTextOpacity(withDelay(delay, withTiming(textTargetOpacity, {duration})));
            setContainerHeight(
                withDelay(
                    delay,
                    withTiming(containerTargetHeight, {duration}, () => {
                        runOnJS(onFinish)();
                    }),
                ),
            );
            setContainerMarginTop(withDelay(delay, withTiming(containerTargetMarginTop, {duration})));
        } else {
            resetAnimation();
        }
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning]);

    return {
        animatedButtonStyles,
        animatedContainerStyles,
        animatedTextStyles,
        resetAnimation,
    };
};

export default useButtonAnimation;
