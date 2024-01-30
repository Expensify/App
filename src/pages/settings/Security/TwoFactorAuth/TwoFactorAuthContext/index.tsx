import {createContext} from 'react';
import type {TwoFactorAuthStep} from '@src/types/onyx/Account';

type TwoFactorAuthContextType = {
    setStep: (step: TwoFactorAuthStep, animationDirection?: string) => void;
};

const TwoFactorAuthContext = createContext<TwoFactorAuthContextType>({
    setStep: () => {},
});

export default TwoFactorAuthContext;