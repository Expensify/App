import type React from 'react';
import {createContext} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AnimationDirection = ValueOf<typeof CONST.ANIMATION_DIRECTION>;

type StepContext = {
    animationDirection: AnimationDirection;
    setAnimationDirection: React.Dispatch<React.SetStateAction<AnimationDirection>>;
};

const AnimatedStepContext = createContext<StepContext | null>(null);

export default AnimatedStepContext;
export type {StepContext, AnimationDirection};
