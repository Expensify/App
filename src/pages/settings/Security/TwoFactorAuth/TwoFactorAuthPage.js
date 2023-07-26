import React, {useCallback, useEffect, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import CodesStep from './Steps/CodesStep';
import DisableStep from './Steps/DisableStep';
import IsEnabledStep from './Steps/IsEnabledStep';
import VerifyStep from './Steps/VerifyStep';
import SuccessStep from './Steps/SuccessStep';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as TwoFactorAuthActions from '../../../../libs/actions/TwoFactorAuthActions';
import TwoFactorAuthContext from './TwoFactorAuthContext';
import {defaultAccount, TwoFactorAuthPropTypes} from './TwoFactorAuthPropTypes';

function TwoFactorAuthPage({account = defaultAccount}) {
    const [currentStep, setCurrentStep] = useState(CONST.TWO_FACTOR_AUTH_STEPS.CODES);

    useEffect(() => () => TwoFactorAuthActions.clearTwoFactorAuthData(), []);

    useEffect(() => {
        if (account.twoFactorAuthStep) {
            setCurrentStep(account.twoFactorAuthStep);
            return;
        }
        if (account.requiresTwoFactorAuth) {
            setCurrentStep(CONST.TWO_FACTOR_AUTH_STEPS.ENABLED);
        } else {
            setCurrentStep(CONST.TWO_FACTOR_AUTH_STEPS.CODES);
        }
        // we don't want to trigger the hook every time the step changes, only when the requiresTwoFactorAuth changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account.requiresTwoFactorAuth]);

    const handleSetStep = useCallback((step) => {
        TwoFactorAuthActions.setTwoFactorAuthStep(step);
        setCurrentStep(step);
    }, []);

    const renderStep = () => {
        switch (currentStep) {
            case CONST.TWO_FACTOR_AUTH_STEPS.CODES:
                return <CodesStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.VERIFY:
                return <VerifyStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS:
                return <SuccessStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.ENABLED:
                return <IsEnabledStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLED:
                return <DisableStep />;
            default:
                return <CodesStep />;
        }
    };

    return <TwoFactorAuthContext.Provider value={{setStep: handleSetStep}}>{renderStep()}</TwoFactorAuthContext.Provider>;
}

TwoFactorAuthPage.propTypes = TwoFactorAuthPropTypes;

// eslint-disable-next-line rulesdir/onyx-props-must-have-default
export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(TwoFactorAuthPage);
