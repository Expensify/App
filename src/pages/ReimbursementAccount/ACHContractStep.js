import PropTypes from 'prop-types';
import React, {useState} from 'react';
import BeneficialOwnerInfo from './BeneficialOwnerInfo/BeneficialOwnerInfo';
import CompleteVerification from './CompleteVerification/CompleteVerification';

const propTypes = {
    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: PropTypes.func.isRequired,
};

function ACHContractStep({onBackButtonPress, onCloseButtonPress}) {
    const [isBeneficialOwnerInfoSet, setIsBeneficialOwnerInfoSet] = useState(false);
    const handleCompleteVerificationBackButtonPress = () => setIsBeneficialOwnerInfoSet(false);

    if (isBeneficialOwnerInfoSet) {
        return (
            <CompleteVerification
                onBackButtonPress={handleCompleteVerificationBackButtonPress}
                onCloseButtonPress={onCloseButtonPress}
            />
        );
    }

    return (
        <BeneficialOwnerInfo
            onBackButtonPress={onBackButtonPress}
            onCloseButtonPress={onCloseButtonPress}
            setIsBeneficialOwnerInfoSet={setIsBeneficialOwnerInfoSet}
        />
    );
}

ACHContractStep.propTypes = propTypes;
ACHContractStep.displayName = 'ACHContractStep';
export default ACHContractStep;
