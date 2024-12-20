import React, {useCallback, useMemo, useState} from 'react';
import {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';
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

    const {windowWidth} = useWindowDimensions();
    // We need to use isSmallScreenWidth, to apply the correct width for the sidebar
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const setStep = useCallback(
        (newStep: string, direction: AnimationDirection) => {
            setAnimationDirection(direction);
            setPreviousStep(currentStep);
            setCurrentStep(newStep);

            const sideBarWidth = isSmallScreenWidth ? windowWidth : variables.sideBarWidth;
            const currentStepPosition = direction === 'in' ? sideBarWidth : -CONST.ANIMATED_TRANSITION_FROM_VALUE;
            const previousStepPosition = direction === 'in' ? -CONST.ANIMATED_TRANSITION_FROM_VALUE : sideBarWidth;

            currentTranslateX.set(currentStepPosition);
            currentTranslateX.set(withTiming(0, {duration: ANIMATED_SCREEN_TRANSITION, easing: Easing.inOut(Easing.cubic)}, () => setPreviousStep(null)));

            prevTranslateX.set(0);
            prevTranslateX.set(withTiming(previousStepPosition, {duration: ANIMATED_SCREEN_TRANSITION, easing: Easing.inOut(Easing.cubic)}));
        },
        [currentStep, currentTranslateX, prevTranslateX, isSmallScreenWidth, windowWidth],
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
