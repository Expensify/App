import React from 'react';
import {View} from 'react-native';
import ProductionLogo from '../../assets/images/expensify-wordmark.svg';
import DevLogo from '../../assets/images/expensify-logo--dev.svg';
import StagingLogo from '../../assets/images/expensify-logo--staging.svg';
import AdHocLogo from '../../assets/images/expensify-logo--adhoc.svg';
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
    // PascalCase is required for React components, so capitalize the const here
    const LogoComponent = logoComponents[props.environment] || AdHocLogo;
    return (
        <>
            <View
                style={[
                    StyleUtils.getSignInWordmarkWidthStyle(props.environment, props.isSmallScreenWidth),
                    StyleUtils.getHeight(props.isSmallScreenWidth ? variables.signInLogoHeightSmallScreen : variables.signInLogoHeight),
                    props.isSmallScreenWidth && (props.environment === CONST.ENVIRONMENT.DEV || props.environment === CONST.ENVIRONMENT.STAGING) ? styles.ml3 : {},
                ]}
            >
                <LogoComponent fill={themeColors.success} />
            </View>
        </>
    );
};

ExpensifyWordmark.displayName = 'ExpensifyWordmark';
ExpensifyWordmark.propTypes = propTypes;
export default compose(withEnvironment, withWindowDimensions)(ExpensifyWordmark);
