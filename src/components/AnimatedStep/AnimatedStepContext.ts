import {createContext} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AnimationDirection = ValueOf<typeof CONST.ANIMATION_DIRECTION>;

type StepContext = {
    currentStep: string;
    previousStep: string | null;
    setStep: (newStep: string, direction: AnimationDirection) => void;
    renderStep: () => React.ReactNode;
    currentScreenAnimatedStyle: StyleProp<ViewStyle>;
    previousScreenAnimatedStyle: StyleProp<ViewStyle>;
};

const AnimatedStepContext = createContext<StepContext | null>(null);

export default AnimatedStepContext;
export type {StepContext, AnimationDirection};
