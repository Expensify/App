import React, {useEffect, useMemo} from 'react';
import type {AnimationDirection} from '@components/AnimatedStep/AnimatedStepContext';
import useAnimatedStepContext from '@components/AnimatedStep/useAnimatedStepContext';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import type {TwoFactorAuthStep} from '@src/types/onyx/Account';
import TwoFactorAuthContext from './TwoFactorAuthContext';

function TwoFactorAuthSteps() {
    const {renderStep, setStep} = useAnimatedStepContext();

    useEffect(() => () => TwoFactorAuthActions.clearTwoFactorAuthData(), []);

    const contextValue = useMemo(
        () => ({
            setStep: (step: TwoFactorAuthStep, direction: AnimationDirection = CONST.ANIMATION_DIRECTION.IN) => {
                setStep(step, direction);
            },
        }),
        [setStep],
    );

    return <TwoFactorAuthContext.Provider value={contextValue}>{renderStep()}</TwoFactorAuthContext.Provider>;
}

export default TwoFactorAuthSteps;
