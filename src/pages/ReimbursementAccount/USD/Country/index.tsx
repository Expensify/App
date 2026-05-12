import React from 'react';
import CountryFullStep from '@components/SubStepForms/CountryFullStep';
import {goToWithdrawalAccountSetupStep} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';

type CountryProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Array of step names */
    stepNames: readonly string[];

    /** Method to set the state of setUSDBankAccountStep */
    setUSDBankAccountStep?: (step: string | null) => void;

    /** ID of current policy */
    policyID: string | undefined;
};

function Country({onBackButtonPress, stepNames, setUSDBankAccountStep, policyID}: CountryProps) {
    const submit = () => {
        if (!setUSDBankAccountStep) {
            return;
        }

        setUSDBankAccountStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
        goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
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
