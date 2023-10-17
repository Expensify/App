import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {Image} from 'expo-image';
import ProductionLogo from '../../assets/images/expensify-wordmark.svg';
import DevLogo from '../../assets/images/expensify-logo--dev.svg';
import StagingLogo from '../../assets/images/expensify-logo--staging.svg';
import AdHocLogo from '../../assets/images/expensify-logo--adhoc.svg';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import variables from '../styles/variables';
import useEnvironment from '../hooks/useEnvironment';

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
                <Image
                    contentFit="contain"
                    source={LogoComponent}
                    style={{width: '100%', height: '100%'}}
                />
            </View>
        </>
    );
}

ExpensifyWordmark.displayName = 'ExpensifyWordmark';
ExpensifyWordmark.defaultProps = defaultProps;
ExpensifyWordmark.propTypes = propTypes;
export default withWindowDimensions(ExpensifyWordmark);
