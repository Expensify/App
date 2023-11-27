import PropTypes from 'prop-types';
import React from 'react';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import VerifyIdentity from './VerifyIdentity/VerifyIdentity';

const propTypes = {
    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** If we should show Onfido flow */
    shouldShowOnfido: PropTypes.bool.isRequired,
};

const RequestorStep = React.forwardRef(({shouldShowOnfido, onBackButtonPress}, ref) => {
    if (shouldShowOnfido) {
        return <VerifyIdentity onBackButtonPress={onBackButtonPress} />;
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
