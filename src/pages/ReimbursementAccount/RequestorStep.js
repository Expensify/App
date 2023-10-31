import React from 'react';
import PropTypes from 'prop-types';
import RequestorOnfidoStep from './RequestorOnfidoStep';
import ScreenWrapper from '../../components/ScreenWrapper';
import {reimbursementAccountPropTypes} from './reimbursementAccountPropTypes';
import PersonalInfo from './PersonalInfo/PersonalInfo';

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
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    return (
        <ScreenWrapper
            testID={RequestorStep.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            <PersonalInfo />
        </ScreenWrapper>
    );
}

RequestorStep.propTypes = propTypes;
RequestorStep.displayName = 'RequestorStep';

export default React.forwardRef(RequestorStep);
