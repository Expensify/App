import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import AdHocLogo from '@assets/images/expensify-logo--adhoc.svg';
import DevLogo from '@assets/images/expensify-logo--dev.svg';
import StagingLogo from '@assets/images/expensify-logo--staging.svg';
import ProductionLogo from '@assets/images/expensify-wordmark.svg';
import useEnvironment from '@hooks/useEnvironment';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    style: {},
};

const logoComponents = {
    [CONST.ENVIRONMENT.DEV]: DevLogo,
    [CONST.ENVIRONMENT.STAGING]: StagingLogo,
    [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
};

function ExpensifyWordmark(props) {
    const {environment} = useEnvironment();
    // PascalCase is required for React components, so capitalize the const here

    const LogoComponent = logoComponents[environment] || AdHocLogo;
    return (
        <>
            <View
                style={[
                    StyleUtils.getSignInWordmarkWidthStyle(environment, props.isSmallScreenWidth),
                    StyleUtils.getHeight(props.isSmallScreenWidth ? variables.signInLogoHeightSmallScreen : variables.signInLogoHeight),
                    props.isSmallScreenWidth && (environment === CONST.ENVIRONMENT.DEV || environment === CONST.ENVIRONMENT.STAGING) ? styles.ml3 : {},
                    ...(_.isArray(props.style) ? props.style : [props.style]),
                ]}
            >
                <LogoComponent fill={themeColors.success} />
            </View>
        </>
    );
}

ExpensifyWordmark.displayName = 'ExpensifyWordmark';
ExpensifyWordmark.defaultProps = defaultProps;
ExpensifyWordmark.propTypes = propTypes;
export default withWindowDimensions(ExpensifyWordmark);
