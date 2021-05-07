import React from 'react';
import PropTypes from 'prop-types';
import ProductionLogo from '../../../assets/images/expensify-cash.svg';
import DevLogo from '../../../assets/images/expensify-cash-dev.svg';
import StagingLogo from '../../../assets/images/expensify-cash-stg.svg';
import CONST from '../../CONST';
import Environment from '../../libs/Environment';

const propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

const ExpensifyCashLogo = (props) => {
    const environment = Environment.getEnvironment();

    switch (environment) {
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
