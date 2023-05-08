import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
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

    /** The styles to apply for the View wrapping the svg */
    containerStyles: PropTypes.array,

    /** Fill color of the svg */
    color: PropTypes.string,
};


const defaultProps = {
    containerStyles: [],
    color: themeColors.success,
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
            <View style={[
                StyleUtils.getSignInWordmarkWidthStyle(props.environment, props.isSmallScreenWidth),
                StyleUtils.getHeight(props.isSmallScreenWidth ? variables.signInLogoHeightSmallScreen : variables.signInLogoHeight),
                ...props.containerStyles,
            ]}
            >
                <LogoComponent fill={props.color} />
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
