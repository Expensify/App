/* eslint-disable import/no-duplicates */
import React from 'react';
import ProductionLogo from '../../assets/images/expensify-wordmark.svg';
import DevLogo from '../../assets/images/expensify-logo--dev.svg';
import StagingLogo from '../../assets/images/expensify-logo--staging.svg';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';

const propTypes = {
    ...environmentPropTypes,
    ...windowDimensionsPropTypes,
};

// 144 -> 162
// 120 -> 130

const logoComponents = {
    [CONST.ENVIRONMENT.DEV]: DevLogo,
    [CONST.ENVIRONMENT.STAGING]: StagingLogo,
    [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
};

const ExpensifyWordmark = (props) => {
    const logoSizes = {
        [CONST.ENVIRONMENT.DEV]: props.isSmallScreenWidth ? 132 : 144,
        [CONST.ENVIRONMENT.STAGING]: 132,
        [CONST.ENVIRONMENT.PRODUCTION]: 120,
    };

    const logoMargins = {
        [CONST.ENVIRONMENT.DEV]: styles.ml3,
        [CONST.ENVIRONMENT.STAGING]: styles.ml3,
        [CONST.ENVIRONMENT.PRODUCTION]: {},
    };

    // PascalCase is required for React components, so capitalize the const here
    const LogoComponent = logoComponents[props.environment];
    return (<LogoComponent width={logoSizes[props.environment]} height="100%" fill={themeColors.success} styles={logoMargins[props.environment]} />);
};

ExpensifyWordmark.displayName = 'ExpensifyWordmark';
ExpensifyWordmark.propTypes = propTypes;
export default compose(
    withEnvironment,
    withWindowDimensions,
)(ExpensifyWordmark);
