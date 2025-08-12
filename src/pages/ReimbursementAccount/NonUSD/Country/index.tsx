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
};

function Country({onBackButtonPress, onSubmit, stepNames, policyID}: CountryProps) {
    return (
        <CountryFullStep
            onBackButtonPress={onBackButtonPress}
            onSubmit={onSubmit}
            stepNames={stepNames}
            policyID={policyID}
        />
    );
}

Country.displayName = 'Country';

export default Country;
