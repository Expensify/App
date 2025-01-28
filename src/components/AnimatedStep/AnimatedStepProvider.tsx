import type {ReactNode} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {AnimationDirection} from './AnimatedStepContext';
import AnimatedStepContext from './AnimatedStepContext';

type AnimatedStepProviderProps = ChildrenProps & {
    /** The initial step to render */
    initialStep: string;
    /** Object with the steps to render */
    steps: Record<string, ReactNode>;
};

function AnimatedStepProvider({children, steps, initialStep}: AnimatedStepProviderProps): React.ReactNode {
    const [currentStep, setCurrentStep] = useState<string>(initialStep);
    const [previousStep, setPreviousStep] = useState<string | null>(null);
    const translateX = useSharedValue({currentScreen: 0, previousScreen: 0});
    const animationDirection = useSharedValue<AnimationDirection>(CONST.ANIMATION_DIRECTION.IN);

    const {windowWidth} = useWindowDimensions();
    // We need to use isSmallScreenWidth, to apply the correct width for the sidebar
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const setStep = useCallback(
        (newStep: string, direction: AnimationDirection) => {
            if (currentStep === newStep || !!previousStep) {
                return;
            }

            animationDirection.set(direction);
            setPreviousStep(currentStep);
            setCurrentStep(newStep);

            const sideBarWidth = isSmallScreenWidth ? windowWidth : variables.sideBarWidth;
            const currentStepPosition = direction === CONST.ANIMATION_DIRECTION.IN ? sideBarWidth : -CONST.ANIMATED_TRANSITION_FROM_VALUE;
            const previousStepPosition = direction === CONST.ANIMATION_DIRECTION.IN ? -CONST.ANIMATED_TRANSITION_FROM_VALUE : sideBarWidth;

            translateX.set({currentScreen: currentStepPosition, previousScreen: 0});
            translateX.set(
                withTiming({currentScreen: 0, previousScreen: previousStepPosition}, {duration: CONST.ANIMATED_SCREEN_TRANSITION, easing: Easing.inOut(Easing.cubic)}, () =>
                    runOnJS(setPreviousStep)(null),
                ),
            );
        },
        [currentStep, previousStep, animationDirection, isSmallScreenWidth, windowWidth, translateX],
    );

    const currentScreenAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.get().currentScreen}],
    }));

    const previousScreenAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.get().previousScreen}],
        zIndex: animationDirection.get() === CONST.ANIMATION_DIRECTION.IN ? -1 : 1,
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
