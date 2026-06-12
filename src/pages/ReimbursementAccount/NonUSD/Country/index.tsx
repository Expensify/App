import React from 'react';
import CountryFullStep from '@components/SubStepForms/CountryFullStep';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';

function Country({onBackButtonPress, onSubmit, stepNames, policyID, isComingFromExpensifyCard}: NonUSDPageProps) {
    return (
        <CountryFullStep
            onBackButtonPress={onBackButtonPress}
            onSubmit={onSubmit}
            isComingFromExpensifyCard={isComingFromExpensifyCard}
            stepNames={stepNames ?? []}
            policyID={policyID}
        />
    );
}

export default Country;
