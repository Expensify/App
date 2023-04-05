import React from 'react';
import {View} from 'react-native';
import ProductionLogo from '../../assets/images/expensify-wordmark.svg';
import DevLogo from '../../assets/images/expensify-logo--dev.svg';
import StagingLogo from '../../assets/images/expensify-logo--staging.svg';
import CONST from '../CONST';
import withEnvironment, {environmentPropTypes} from './withEnvironment';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import variables from '../styles/variables';

const propTypes = {
    ...environmentPropTypes,
    ...windowDimensionsPropTypes,
};

const logoComponents = {
    [CONST.ENVIRONMENT.DEV]: DevLogo,
    [CONST.ENVIRONMENT.STAGING]: StagingLogo,
    [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
};

const ExpensifyWordmark = (props) => {
    const logoPillWidth = props.isSmallScreenWidth ? variables.signInLogoWidthPill : variables.signInLogoWidthLargeScreenPill;
    const logoPillLeftMargin = props.isSmallScreenWidth ? styles.ml3 : {};

    const logoWidth = {
        [CONST.ENVIRONMENT.DEV]: logoPillWidth,
        [CONST.ENVIRONMENT.STAGING]: logoPillWidth,
        [CONST.ENVIRONMENT.PRODUCTION]: props.isSmallScreenWidth ? variables.signInLogoWidth : variables.signInLogoWidthLargeScreen,
    };

    const logoMargins = {
        [CONST.ENVIRONMENT.DEV]: logoPillLeftMargin,
        [CONST.ENVIRONMENT.STAGING]: logoPillLeftMargin,
        [CONST.ENVIRONMENT.PRODUCTION]: {},
    };

    // PascalCase is required for React components, so capitalize the const here
    const LogoComponent = logoComponents[props.environment];
    return (
        <>
            <View style={[StyleUtils.getWidthStyle(logoWidth[props.environment]), styles.h100, logoMargins[props.environment]]}>
                <LogoComponent fill={themeColors.success} />
            </View>
        </>
    );
};

ExpensifyWordmark.displayName = 'ExpensifyWordmark';
ExpensifyWordmark.propTypes = propTypes;
export default compose(
    withEnvironment,
    withWindowDimensions,
)(ExpensifyWordmark);
