import PropTypes from 'prop-types';
import React from 'react';
import VerifyIdentity from '@pages/ReimbursementAccount/VerifyIdentity/VerifyIdentity';
import PersonalInfo from './PersonalInfo/PersonalInfo';

const propTypes = {
    onBackButtonPress: PropTypes.func.isRequired,
    /** If we should show Onfido flow */
    shouldShowOnfido: PropTypes.bool.isRequired,
};

const RequestorStep = React.forwardRef(({shouldShowOnfido, onBackButtonPress}, ref) => {
    if (shouldShowOnfido) {
        return (
            <VerifyIdentity
                ref={ref}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    return (
        <PersonalInfo
            ref={ref}
            onBackButtonPress={onBackButtonPress}
        />
    );
});

RequestorStep.propTypes = propTypes;
RequestorStep.displayName = 'RequestorStep';

export default RequestorStep;
