import {createContext} from 'react';
import type {AnimationDirection} from '@components/AnimatedStep/AnimatedStepContext';
import type {TwoFactorAuthStep} from '@src/types/onyx/Account';

type TwoFactorAuthContextType = {
    setStep: (step: TwoFactorAuthStep, animationDirection?: AnimationDirection) => void;
};

const TwoFactorAuthContext = createContext<TwoFactorAuthContextType>({
    setStep: () => {},
});

export default TwoFactorAuthContext;
