import PropTypes from 'prop-types';
import React from 'react';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import VerifyIdentity from './VerifyIdentity/VerifyIdentity';

const propTypes = {
    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: PropTypes.func.isRequired,

    /** If we should show Onfido flow */
    shouldShowOnfido: PropTypes.bool.isRequired,
};

const RequestorStep = React.forwardRef(({shouldShowOnfido, onBackButtonPress, onCloseButtonPress}, ref) => {
    if (shouldShowOnfido) {
        return (
            <VerifyIdentity
                onBackButtonPress={onBackButtonPress}
                onCloseButtonPress={onCloseButtonPress}
            />
        );
    }

    return (
        <PersonalInfo
            ref={ref}
            onBackButtonPress={onBackButtonPress}
            onCloseButtonPress={onCloseButtonPress}
        />
    );
});

RequestorStep.propTypes = propTypes;
RequestorStep.displayName = 'RequestorStep';

export default RequestorStep;
