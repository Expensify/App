import React, {useCallback, useEffect, useState} from 'react';
import {withOnyx} from "react-native-onyx";
import PropTypes from "prop-types";
import CodesStep from "./Steps/CodesStep";
import DisableStep from "./Steps/DisableStep";
import IsEnabledStep from "./Steps/IsEnabledStep";
import VerifyStep from "./Steps/VerifyStep";
import SuccessStep from "./Steps/SuccessStep";
import ONYXKEYS from "../../../../ONYXKEYS";
import CONST from "../../../../CONST";
import * as TwoFactorAuthActions from '../../../../libs/actions/TwoFactorAuthActions';

const propTypes = {
    account: PropTypes.shape({
        /** Whether or not the user has two factor authentication enabled */
        requiresTwoFactorAuth: PropTypes.bool,

        /** The current step in the two factor authentication process */
        twoFactorAuthStep: PropTypes.string,
    }),
}

const defaultProps = {
    account: {
        requiresTwoFactorAuth: false,
        twoFactorAuthStep: '',
    }
}

function TwoFactorAuthPage({account,}) {
    const [currentStep, setCurrentStep] = useState(CONST.TWO_FACTOR_AUTH_STEPS.CODES);

    useEffect(() => {
        if (account.twoFactorAuthStep) {
            setCurrentStep(account.twoFactorAuthStep);
            return
        }
        if (account.requiresTwoFactorAuth) {
            setCurrentStep(CONST.TWO_FACTOR_AUTH_STEPS.IS_ENABLED);
        } else {
            setCurrentStep(CONST.TWO_FACTOR_AUTH_STEPS.CODES);
        }
    }, [account.requiresTwoFactorAuth]);

    const handleSetStep = useCallback((step) => {
        TwoFactorAuthActions.setTwoFactorAuthStep(step)
        setCurrentStep(step)
    }, []);

    const renderStep = () => {
        switch (currentStep) {
            case CONST.TWO_FACTOR_AUTH_STEPS.CODES:
                return <CodesStep setStep={handleSetStep}/>;
            case CONST.TWO_FACTOR_AUTH_STEPS.VERIFY:
                return <VerifyStep setStep={handleSetStep}/>;
            case CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS:
                return <SuccessStep setStep={handleSetStep}/>;
            case CONST.TWO_FACTOR_AUTH_STEPS.IS_ENABLED:
                return <IsEnabledStep setStep={handleSetStep}/>;
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLE:
                return <DisableStep/>;
            default:
                return <CodesStep setStep={handleSetStep}/>;
        }
    }

    return (
        <>
            {renderStep()}
        </>
    );
};

TwoFactorAuthPage.propTypes = propTypes;
TwoFactorAuthPage.defaultProps = defaultProps;


export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(TwoFactorAuthPage);
