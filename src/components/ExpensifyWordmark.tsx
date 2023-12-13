import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import AdHocLogo from '@assets/images/expensify-logo--adhoc.svg';
import DevLogo from '@assets/images/expensify-logo--dev.svg';
import StagingLogo from '@assets/images/expensify-logo--staging.svg';
import ProductionLogo from '@assets/images/expensify-wordmark.svg';
import useEnvironment from '@hooks/useEnvironment';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import withWindowDimensions from './withWindowDimensions';
import type {WindowDimensionsProps} from './withWindowDimensions/types';

type ExpensifyWordmarkProps = WindowDimensionsProps & {
    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;
};

const logoComponents = {
    [CONST.ENVIRONMENT.DEV]: DevLogo,
    [CONST.ENVIRONMENT.STAGING]: StagingLogo,
    [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
    [CONST.ENVIRONMENT.ADHOC]: AdHocLogo,
};

function ExpensifyWordmark({isSmallScreenWidth, style}: ExpensifyWordmarkProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {environment} = useEnvironment();
    // PascalCase is required for React components, so capitalize the const here
    const LogoComponent = logoComponents[environment];

    return (
        <>
            <View
                style={[
                    StyleUtils.getSignInWordmarkWidthStyle(isSmallScreenWidth, environment),
                    StyleUtils.getHeight(isSmallScreenWidth ? variables.signInLogoHeightSmallScreen : variables.signInLogoHeight),
                    isSmallScreenWidth && (environment === CONST.ENVIRONMENT.DEV || environment === CONST.ENVIRONMENT.STAGING) ? styles.ml3 : {},
                    style,
                ]}
            >
                <LogoComponent fill={theme.success} />
            </View>
        </>
    );
}

ExpensifyWordmark.displayName = 'ExpensifyWordmark';

export default withWindowDimensions(ExpensifyWordmark);
