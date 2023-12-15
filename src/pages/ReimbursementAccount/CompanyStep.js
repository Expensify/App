import PropTypes from 'prop-types';
import React from 'react';
import BusinessInfo from './BusinessInfo/BusinessInfo';

const propTypes = {
    /* The workspace policyID */
    policyID: PropTypes.string,

    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: PropTypes.func.isRequired,
};

const defaultProps = {
    policyID: '',
};

function CompanyStep({policyID, onBackButtonPress, onCloseButtonPress}) {
    return (
        <BusinessInfo
            policyID={policyID}
            onBackButtonPress={onBackButtonPress}
            onCloseButtonPress={onCloseButtonPress}
        />
    );
}

CompanyStep.propTypes = propTypes;
CompanyStep.defaultProps = defaultProps;
CompanyStep.displayName = 'CompanyStep';

export default CompanyStep;
