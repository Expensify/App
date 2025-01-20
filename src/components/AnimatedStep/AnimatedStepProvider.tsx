import type {ReactNode} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {AnimationDirection} from './AnimatedStepContext';
import AnimatedStepContext from './AnimatedStepContext';

type AnimatedStepProviderProps = ChildrenProps & {
    initialStep: string;
    steps: Record<string, ReactNode>;
};

function AnimatedStepProvider({children, steps, initialStep}: AnimatedStepProviderProps): React.ReactNode {
    const [animationDirection, setAnimationDirection] = useState<AnimationDirection>(CONST.ANIMATION_DIRECTION.IN);
    const [currentStep, setCurrentStep] = useState<string>(initialStep);
    const [previousStep, setPreviousStep] = useState<string | null>(null);

    const currentTranslateX = useSharedValue(0);
    const prevTranslateX = useSharedValue(0);

    const {windowWidth} = useWindowDimensions();
    // We need to use isSmallScreenWidth, to apply the correct width for the sidebar
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const setStep = useCallback(
        (newStep: string, direction: AnimationDirection) => {
            if (currentStep === newStep || !!previousStep) {
                return;
            }

            setAnimationDirection(direction);
            setPreviousStep(currentStep);
            setCurrentStep(newStep);

            const sideBarWidth = isSmallScreenWidth ? windowWidth : variables.sideBarWidth;
            const currentStepPosition = direction === CONST.ANIMATION_DIRECTION.IN ? sideBarWidth : -CONST.ANIMATED_TRANSITION_FROM_VALUE;
            const previousStepPosition = direction === CONST.ANIMATION_DIRECTION.IN ? -CONST.ANIMATED_TRANSITION_FROM_VALUE : sideBarWidth;

            currentTranslateX.set(currentStepPosition);
            currentTranslateX.set(withTiming(0, {duration: CONST.ANIMATED_SCREEN_TRANSITION, easing: Easing.inOut(Easing.cubic)}, () => setPreviousStep(null)));

            prevTranslateX.set(0);
            prevTranslateX.set(withTiming(previousStepPosition, {duration: CONST.ANIMATED_SCREEN_TRANSITION, easing: Easing.inOut(Easing.cubic)}));
        },
        [currentStep, previousStep, isSmallScreenWidth, windowWidth, currentTranslateX, prevTranslateX],
    );

    const currentScreenAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: currentTranslateX.get()}],
    }));

    const previousScreenAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: prevTranslateX.get()}],
        zIndex: animationDirection === CONST.ANIMATION_DIRECTION.IN ? -1 : 1,
    }));

    const contextValue = useMemo(
        () => ({
            currentStep,
            previousStep,
            setStep,
            currentScreenAnimatedStyle,
            previousScreenAnimatedStyle,
            renderStep: () => {
                return (
                    <>
                        {steps[currentStep]}
                        {previousStep && steps[previousStep]}
                    </>
                );
            },
        }),
        [currentStep, previousStep, setStep, currentScreenAnimatedStyle, previousScreenAnimatedStyle, steps],
    );

    return <AnimatedStepContext.Provider value={contextValue}>{children}</AnimatedStepContext.Provider>;
}

AnimatedStepProvider.displayName = 'AnimatedStepProvider';
export default AnimatedStepProvider;
