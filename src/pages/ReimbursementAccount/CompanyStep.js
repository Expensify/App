import PropTypes from 'prop-types';
import React from 'react';
import BusinessInfo from './BusinessInfo/BusinessInfo';

const propTypes = {
    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: PropTypes.func.isRequired,
};

function CompanyStep({onBackButtonPress, onCloseButtonPress}) {
    return (
        <BusinessInfo
            onBackButtonPress={onBackButtonPress}
            onCloseButtonPress={onCloseButtonPress}
        />
    );
}

CompanyStep.propTypes = propTypes;
CompanyStep.displayName = 'CompanyStep';

export default CompanyStep;
