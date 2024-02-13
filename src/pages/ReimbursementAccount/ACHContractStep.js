import PropTypes from 'prop-types';
import React from 'react';
import CompleteVerification from './CompleteVerification/CompleteVerification';

const propTypes = {
    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,
};

function ACHContractStep({onBackButtonPress}) {
    return <CompleteVerification onBackButtonPress={onBackButtonPress} />;
}

ACHContractStep.propTypes = propTypes;
ACHContractStep.displayName = 'ACHContractStep';
export default ACHContractStep;
