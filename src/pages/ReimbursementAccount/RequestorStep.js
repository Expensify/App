import PropTypes from 'prop-types';
import React from 'react';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import {reimbursementAccountPropTypes} from './reimbursementAccountPropTypes';
import RequestorOnfidoStep from './RequestorOnfidoStep';

const propTypes = {
    onBackButtonPress: PropTypes.func.isRequired,
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    /** If we should show Onfido flow */
    shouldShowOnfido: PropTypes.bool.isRequired,
};

function RequestorStep({reimbursementAccount, shouldShowOnfido, onBackButtonPress}) {
    if (shouldShowOnfido) {
        return (
            <RequestorOnfidoStep
                ref={ref}
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    return <PersonalInfo />;
}

RequestorStep.propTypes = propTypes;
RequestorStep.displayName = 'RequestorStep';

export default RequestorStep;
