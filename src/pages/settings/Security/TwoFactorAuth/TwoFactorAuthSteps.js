import {useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import useAnimatedStepContext from '@components/AnimatedStep/useAnimatedStepContext';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import CodesStep from './Steps/CodesStep';
import DisabledStep from './Steps/DisabledStep';
import EnabledStep from './Steps/EnabledStep';
import SuccessStep from './Steps/SuccessStep';
import VerifyStep from './Steps/VerifyStep';
import TwoFactorAuthContext from './TwoFactorAuthContext';
import {defaultAccount, TwoFactorAuthPropTypes} from './TwoFactorAuthPropTypes';

function TwoFactorAuthSteps({account = defaultAccount}) {
    const route = useRoute();
    const backTo = lodashGet(route.params, 'backTo', '');
    const currentStep = useMemo(() => {
        if (account.twoFactorAuthStep) {
            return account.twoFactorAuthStep;
        }
        return account.requiresTwoFactorAuth ? CONST.TWO_FACTOR_AUTH_STEPS.ENABLED : CONST.TWO_FACTOR_AUTH_STEPS.CODES;
    }, [account.requiresTwoFactorAuth, account.twoFactorAuthStep]);

    const {setAnimationDirection} = useAnimatedStepContext();

    useEffect(() => () => TwoFactorAuthActions.clearTwoFactorAuthData(), []);
    const handleSetStep = useCallback(
        (step, animationDirection = CONST.ANIMATION_DIRECTION.IN) => {
            setAnimationDirection(animationDirection);
            TwoFactorAuthActions.setTwoFactorAuthStep(step);
        },
        [setAnimationDirection],
    );
    const contextValue = useMemo(() => ({setStep: handleSetStep}), [handleSetStep]);

    const renderStep = () => {
        switch (currentStep) {
            case CONST.TWO_FACTOR_AUTH_STEPS.CODES:
                return <CodesStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.VERIFY:
                return <VerifyStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS:
                return <SuccessStep backTo={backTo} />;
            case CONST.TWO_FACTOR_AUTH_STEPS.ENABLED:
                return <EnabledStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLED:
                return <DisabledStep />;
            default:
                return <CodesStep />;
        }
    };

    return <TwoFactorAuthContext.Provider value={contextValue}>{renderStep()}</TwoFactorAuthContext.Provider>;
}

TwoFactorAuthSteps.propTypes = TwoFactorAuthPropTypes;

// eslint-disable-next-line rulesdir/onyx-props-must-have-default
export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(TwoFactorAuthSteps);
