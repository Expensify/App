/* eslint-disable import/no-duplicates */
import React from 'react';
import ProductionLogo from '../../assets/images/expensify-wordmark.svg';
import DevLogo from '../../assets/images/expensify-wordmark.svg';
import StagingLogo from '../../assets/images/expensify-wordmark.svg';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';
import themeColors from '../styles/themes/default';

const propTypes = {
    ...environmentPropTypes,
};

const logoComponents = {
    [CONST.ENVIRONMENT.DEV]: DevLogo,
    [CONST.ENVIRONMENT.STAGING]: StagingLogo,
    [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
};

const ExpensifyWordmark = (props) => {
    // PascalCase is required for React components, so capitalize the const here
    const LogoComponent = logoComponents[props.environment];
    return (<LogoComponent width="100%" height="100%" fill={themeColors.success} />);
};

ExpensifyWordmark.displayName = 'ExpensifyWordmark';
ExpensifyWordmark.propTypes = propTypes;
export default withEnvironment(ExpensifyWordmark);
