import React, {useCallback, useMemo, useState} from 'react';
import {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {AnimationDirection} from './AnimatedStepContext';
import AnimatedStepContext from './AnimatedStepContext';

const ANIMATED_SCREEN_TRANSITION = 400;

type AnimatedStepProviderProps = ChildrenProps & {
    initialStep: string;
    renderStep: (name: string) => React.ReactNode;
};

function AnimatedStepProvider({children, renderStep, initialStep}: AnimatedStepProviderProps): React.ReactNode {
    const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(CONST.ANIMATION_DIRECTION.IN);
    const [currentStep, setCurrentStep] = useState<string>(initialStep);
    const [previousStep, setPreviousStep] = useState<string | null>(null);

    const currentTranslateX = useSharedValue(0);
    const prevTranslateX = useSharedValue(0);

    const setStep = useCallback(
        (newStep: string, direction: AnimationDirection) => {
            setAnimationDirection(direction);
            setPreviousStep(currentStep);
            setCurrentStep(newStep);

            const currentStepPosition = direction === 'in' ? variables.sideBarWidth : -CONST.ANIMATED_TRANSITION_FROM_VALUE;
            const previousStepPosition = direction === 'in' ? -CONST.ANIMATED_TRANSITION_FROM_VALUE : variables.sideBarWidth;

            currentTranslateX.set(currentStepPosition);
            currentTranslateX.set(withTiming(0, {duration: ANIMATED_SCREEN_TRANSITION, easing: Easing.inOut(Easing.cubic)}, () => setPreviousStep(null)));

            prevTranslateX.set(0);
            prevTranslateX.set(withTiming(previousStepPosition, {duration: ANIMATED_SCREEN_TRANSITION, easing: Easing.inOut(Easing.cubic)}));
        },
        [currentStep, currentTranslateX, prevTranslateX],
    );

    const currentScreenAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: currentTranslateX.get()}],
    }));

    const previousScreenAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: prevTranslateX.get()}],
        zIndex: animationDirection === 'in' ? -1 : 1,
    }));

    const contextValue = useMemo(
        () => ({
            currentStep,
            previousStep,
            setStep,
            currentScreenAnimatedStyle,
            previousScreenAnimatedStyle,
            renderStep,
        }),
        [currentStep, previousStep, setStep, currentScreenAnimatedStyle, previousScreenAnimatedStyle, renderStep],
    );

    return <AnimatedStepContext.Provider value={contextValue}>{children}</AnimatedStepContext.Provider>;
}

AnimatedStepProvider.displayName = 'AnimatedStepProvider';
export default AnimatedStepProvider;
