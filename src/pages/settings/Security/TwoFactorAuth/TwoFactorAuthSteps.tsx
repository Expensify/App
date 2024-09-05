import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {AnimationDirection} from '@components/AnimatedStep/AnimatedStepContext';
import useAnimatedStepContext from '@components/AnimatedStep/useAnimatedStepContext';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {TwoFactorAuthStep} from '@src/types/onyx/Account';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import CodesStep from './Steps/CodesStep';
import DisabledStep from './Steps/DisabledStep';
import EnabledStep from './Steps/EnabledStep';
import GetCodeStep from './Steps/GetCode';
import SuccessStep from './Steps/SuccessStep';
import VerifyStep from './Steps/VerifyStep';
import TwoFactorAuthContext from './TwoFactorAuthContext';
import type {BaseTwoFactorAuthFormOnyxProps} from './TwoFactorAuthForm/types';

type TwoFactorAuthStepProps = BaseTwoFactorAuthFormOnyxProps;

function TwoFactorAuthSteps({account}: TwoFactorAuthStepProps) {
    const route = useRoute<RouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.TWO_FACTOR_AUTH>>();
    const backTo = route.params?.backTo ?? '';
    const forwardTo = route.params?.forwardTo ?? '';

    const currentStep = useMemo(() => {
        if (account?.twoFactorAuthStep) {
            return account.twoFactorAuthStep;
        }
        return account?.requiresTwoFactorAuth ? CONST.TWO_FACTOR_AUTH_STEPS.ENABLED : CONST.TWO_FACTOR_AUTH_STEPS.CODES;
    }, [account?.requiresTwoFactorAuth, account?.twoFactorAuthStep]);

    const {setAnimationDirection} = useAnimatedStepContext();

    useEffect(() => () => TwoFactorAuthActions.clearTwoFactorAuthData(), []);

    const handleSetStep = useCallback(
        (step: TwoFactorAuthStep, animationDirection: AnimationDirection = CONST.ANIMATION_DIRECTION.IN) => {
            setAnimationDirection(animationDirection);
            TwoFactorAuthActions.setTwoFactorAuthStep(step);
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
                return (
                    <SuccessStep
                        backTo={backTo}
                        forwardTo={forwardTo}
                    />
                );
            case CONST.TWO_FACTOR_AUTH_STEPS.ENABLED:
                return <EnabledStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLED:
                return <DisabledStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.GETCODE:
                return <GetCodeStep />;
            default:
                return <CodesStep backTo={backTo} />;
        }
    };

    return <TwoFactorAuthContext.Provider value={contextValue}>{renderStep()}</TwoFactorAuthContext.Provider>;
}

export default function TwoFactorAuthStepsOnyx(props: Omit<TwoFactorAuthStepProps, keyof BaseTwoFactorAuthFormOnyxProps>) {
    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);

    if (isLoadingOnyxValue(accountMetadata)) {
        return null;
    }

    return (
        <TwoFactorAuthSteps
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            account={account}
        />
    );
}
