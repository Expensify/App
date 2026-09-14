import CountryFullStep from '@components/SubStepForms/CountryFullStep';

import {goToWithdrawalAccountSetupStep} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';

import React from 'react';

type CountryProps = {
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;

    stepNames: readonly string[];
    policyID: string | undefined;
};

function Country({onBackButtonPress, onSubmit, stepNames, policyID}: CountryProps) {
    const submit = () => {
        goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
        onSubmit?.();
    };

    return (
        <CountryFullStep
            onBackButtonPress={onBackButtonPress}
            onSubmit={submit}
            stepNames={stepNames}
            policyID={policyID}
        />
    );
}

export default Country;
