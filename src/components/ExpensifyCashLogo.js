import React from 'react';
import PropTypes from 'prop-types';
import ProductionLogo from '../../assets/images/expensify-cash.svg';
import DevLogo from '../../assets/images/expensify-cash-dev.svg';
import StagingLogo from '../../assets/images/expensify-cash-stg.svg';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';

const propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    ...environmentPropTypes,
};

const ExpensifyCashLogo = (props) => {
    switch (props.environment) {
        case CONST.ENVIRONMENT.PRODUCTION:
            return <ProductionLogo width={props.width} height={props.height} />;
        case CONST.ENVIRONMENT.STAGING:
            return <StagingLogo width={props.width} height={props.height} />;
        default:
            return <DevLogo width={props.width} height={props.height} />;
    }
};

ExpensifyCashLogo.displayName = 'ExpensifyCashLogo';
ExpensifyCashLogo.propTypes = propTypes;
export default withEnvironment(ExpensifyCashLogo);
