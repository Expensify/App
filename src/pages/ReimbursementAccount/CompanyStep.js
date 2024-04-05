import PropTypes from 'prop-types';
import React from 'react';
import BusinessInfo from './BusinessInfo/BusinessInfo';

const propTypes = {
    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,
};

function CompanyStep({onBackButtonPress}) {
    return <BusinessInfo onBackButtonPress={onBackButtonPress} />;
}

CompanyStep.propTypes = propTypes;
CompanyStep.displayName = 'CompanyStep';

export default CompanyStep;
