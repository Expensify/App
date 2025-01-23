import {createContext} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AnimationDirection = ValueOf<typeof CONST.ANIMATION_DIRECTION>;

type StepContext = {
    /** The current step */
    currentStep: string;

    /** The previous step */
    previousStep: string | null;

    /** Method to change the current step */
    setStep: (newStep: string, direction: AnimationDirection) => void;

    /** Method to render current steps */
    renderStep: () => React.ReactNode;

    /** Animated style for the current screen */
    currentScreenAnimatedStyle: StyleProp<ViewStyle>;

    /** Animated style for the previous screen */
    previousScreenAnimatedStyle: StyleProp<ViewStyle>;
};

const AnimatedStepContext = createContext<StepContext | null>(null);

export default AnimatedStepContext;
export type {StepContext, AnimationDirection};
