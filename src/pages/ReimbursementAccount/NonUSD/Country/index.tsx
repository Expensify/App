import React from 'react';
import CountryFullStep from '@components/SubStepForms/CountryFullStep';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';

function Country({prevPage, onNext, stepNames, policyID, isComingFromExpensifyCard}: NonUSDPageProps) {
    return (
        <CountryFullStep
            onBackButtonPress={() => prevPage?.()}
            onSubmit={() => onNext()}
            isComingFromExpensifyCard={isComingFromExpensifyCard}
            stepNames={stepNames ?? []}
            policyID={policyID}
        />
    );
}

export default Country;
