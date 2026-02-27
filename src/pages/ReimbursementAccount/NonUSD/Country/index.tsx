import React from 'react';
import CountryFullStep from '@components/SubStepForms/CountryFullStep';

type CountryProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Array of step names */
    stepNames: readonly string[];

    /** ID of current policy */
    policyID: string | undefined;

    /** Whether the user is coming from the expensify card */
    isComingFromExpensifyCard?: boolean;
};

function Country({onBackButtonPress, onSubmit, stepNames, policyID, isComingFromExpensifyCard}: CountryProps) {
    return (
        <CountryFullStep
            onBackButtonPress={onBackButtonPress}
            onSubmit={onSubmit}
            isComingFromExpensifyCard={isComingFromExpensifyCard}
            stepNames={stepNames}
            policyID={policyID}
        />
    );
}

export default Country;
