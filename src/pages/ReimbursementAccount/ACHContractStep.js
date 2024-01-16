import PropTypes from 'prop-types';
import React from 'react';
import CompleteVerification from './CompleteVerification/CompleteVerification';

const propTypes = {
    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: PropTypes.func.isRequired,
};

function ACHContractStep({onBackButtonPress, onCloseButtonPress}) {
    return (
        <CompleteVerification
            onBackButtonPress={onBackButtonPress}
            onCloseButtonPress={onCloseButtonPress}
        />
    );
}

ACHContractStep.propTypes = propTypes;
ACHContractStep.displayName = 'ACHContractStep';
export default ACHContractStep;
