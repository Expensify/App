import React from 'react';
import CompleteVerification from './CompleteVerification/CompleteVerification';

type ACHContractStepProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

function ACHContractStep({onBackButtonPress}: ACHContractStepProps) {
    return <CompleteVerification onBackButtonPress={onBackButtonPress} />;
}

ACHContractStep.displayName = 'ACHContractStep';

export default ACHContractStep;
