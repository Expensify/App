import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {AnimationDirection} from '@components/AnimatedStep/AnimatedStepContext';
import useAnimatedStepContext from '@components/AnimatedStep/useAnimatedStepContext';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {TwoFactorAuthStep} from '@src/types/onyx/Account';
import CodesStep from './Steps/CodesStep';
import DisabledStep from './Steps/DisabledStep';
import EnabledStep from './Steps/EnabledStep';
import SuccessStep from './Steps/SuccessStep';
import VerifyStep from './Steps/VerifyStep';
import TwoFactorAuthContext from './TwoFactorAuthContext';
import type {BaseTwoFactorAuthFormOnyxProps} from './TwoFactorAuthForm/types';

type TwoFactorAuthStepProps = BaseTwoFactorAuthFormOnyxProps;

function TwoFactorAuthSteps({account}: TwoFactorAuthStepProps) {
    const route = useRoute<RouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.TWO_FACTOR_AUTH>>();
    const backTo = route.params?.backTo ?? '';
    const [currentStep, setCurrentStep] = useState<TwoFactorAuthStep>(CONST.TWO_FACTOR_AUTH_STEPS.CODES);

    const {setAnimationDirection} = useAnimatedStepContext();

    useEffect(() => () => TwoFactorAuthActions.clearTwoFactorAuthData(), []);

    useEffect(() => {
        if (account?.twoFactorAuthStep) {
            setCurrentStep(account?.twoFactorAuthStep);
            return;
        }

        if (account?.requiresTwoFactorAuth) {
            setCurrentStep(CONST.TWO_FACTOR_AUTH_STEPS.ENABLED);
        } else {
            setCurrentStep(CONST.TWO_FACTOR_AUTH_STEPS.CODES);
        }
    }, [account?.requiresTwoFactorAuth, account?.twoFactorAuthStep]);

    const handleSetStep = useCallback(
        (step: TwoFactorAuthStep, animationDirection: AnimationDirection = CONST.ANIMATION_DIRECTION.IN) => {
            setAnimationDirection(animationDirection);
            TwoFactorAuthActions.setTwoFactorAuthStep(step);
            setCurrentStep(step);
        },
        [setAnimationDirection],
    );
    const contextValue = useMemo(() => ({setStep: handleSetStep}), [handleSetStep]);

    const renderStep = () => {
        switch (currentStep) {
            case CONST.TWO_FACTOR_AUTH_STEPS.CODES:
                return <CodesStep backTo={backTo} />;
            case CONST.TWO_FACTOR_AUTH_STEPS.VERIFY:
                return <VerifyStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS:
                return <SuccessStep backTo={backTo} />;
            case CONST.TWO_FACTOR_AUTH_STEPS.ENABLED:
                return <EnabledStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLED:
                return <DisabledStep />;
            default:
                return <CodesStep backTo={backTo} />;
        }
    };

    return <TwoFactorAuthContext.Provider value={contextValue}>{renderStep()}</TwoFactorAuthContext.Provider>;
}

export default withOnyx<TwoFactorAuthStepProps, BaseTwoFactorAuthFormOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
})(TwoFactorAuthSteps);
