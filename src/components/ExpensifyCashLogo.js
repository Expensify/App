import React from 'react';
import PropTypes from 'prop-types';
import ProductionLogo from '../../assets/images/expensify-cash.svg';
import DevLogo from '../../assets/images/expensify-cash-dev.svg';
import StagingLogo from '../../assets/images/expensify-cash-stg.svg';
import CONFIG from '../CONFIG';
import CONST from '../CONST';

const propTypes = {
    /** Width of logo */
    width: PropTypes.number.isRequired,

    /** Height of logo */
    height: PropTypes.number.isRequired,
};

const ExpensifyCashLogo = (props) => {
    switch (CONFIG.EXPENSIFY.ENVIRONMENT) {
        case CONST.ENVIRONMENT.PRODUCTION:
            return <ProductionLogo width={props.width} height={props.height} />;
        case CONST.ENVIRONMENT.STAGING:
            return <StagingLogo width={props.width} height={props.height} />;
        default:
            return <DevLogo width={props.width} height={props.height} />;
    }
};

ExpensifyCashLogo.propTypes = propTypes;
ExpensifyCashLogo.displayName = 'ExpensifyCashLogo';

export default ExpensifyCashLogo;
