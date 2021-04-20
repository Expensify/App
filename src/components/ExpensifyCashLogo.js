import React from 'react';
import PropTypes from 'prop-types';
import ProductionLogo from '../../assets/images/expensify-cash.svg';
import DevLogo from '../../assets/images/expensify-cash-dev.svg';
import StagingLogo from '../../assets/images/expensify-cash-stg.svg';
import CONFIG from '../CONFIG';
import CONST from '../CONST';

const propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export const ExpensifyCashLogo = (props) => {
    if (CONFIG.EXPENSIFY.ENVIRONMENT === CONST.ENVIRONMENT.PRODUCTION) {
        return <ProductionLogo width={props.width} height={props.height} />;
    }

    if (CONFIG.EXPENSIFY.ENVIRONMENT === CONST.ENVIRONMENT.STAGING) {
        return <StagingLogo width={props.width} height={props.height} />;
    }

    return <DevLogo width={props.width} height={props.height} />;
};

ExpensifyCashLogo.propTypes = propTypes;
ExpensifyCashLogo.displayName = 'ExpensifyCashLogo';

export default ExpensifyCashLogo;
