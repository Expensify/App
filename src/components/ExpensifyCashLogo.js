import React from 'react';
import PropTypes from 'prop-types';
import ProductionLogo from '../../assets/images/new-expensify.svg';
import DevLogo from '../../assets/images/new-expensify-dev.svg';
import StagingLogo from '../../assets/images/new-expensify-stg.svg';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';

const propTypes = {
    /** Width of logo */
    width: PropTypes.number.isRequired,

    /** Height of logo */
    height: PropTypes.number.isRequired,

    ...environmentPropTypes,
};

const logoComponents = {
    [CONST.ENVIRONMENT.DEV]: DevLogo,
    [CONST.ENVIRONMENT.STAGING]: StagingLogo,
    [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
};

const ExpensifyCashLogo = (props) => {
    // PascalCase is required for React components, so capitalize the const here
    const LogoComponent = logoComponents[props.environment];
    return (<LogoComponent width={props.width} height={props.height} />);
};

ExpensifyCashLogo.displayName = 'ExpensifyCashLogo';
ExpensifyCashLogo.propTypes = propTypes;
export default withEnvironment(ExpensifyCashLogo);
