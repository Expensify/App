import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import AdHocLogo from '@assets/images/expensify-logo--adhoc.svg';
import DevLogo from '@assets/images/expensify-logo--dev.svg';
import ProductionLogo from '@assets/images/expensify-logo--prod.svg';
import StagingLogo from '@assets/images/expensify-logo--staging.svg';
import useEnvironment from '@hooks/useEnvironment';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ImageSVG from './ImageSVG';

type ExpensifyWordmarkProps = {
    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;
};

const logoComponents = {
    [CONST.ENVIRONMENT.DEV]: DevLogo,
    [CONST.ENVIRONMENT.STAGING]: StagingLogo,
    [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
    [CONST.ENVIRONMENT.ADHOC]: AdHocLogo,
};

function ExpensifyWordmark({style}: ExpensifyWordmarkProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {environment} = useEnvironment();
    // PascalCase is required for React components, so capitalize the const here
    const LogoComponent = logoComponents[environment];

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View
            style={[
                StyleUtils.getSignInWordmarkWidthStyle(shouldUseNarrowLayout, environment),
                StyleUtils.getHeight(shouldUseNarrowLayout ? variables.signInLogoHeightSmallScreen : variables.signInLogoHeight),
                shouldUseNarrowLayout && (environment === CONST.ENVIRONMENT.DEV || environment === CONST.ENVIRONMENT.STAGING) ? styles.ml3 : {},
                style,
            ]}
        >
            <ImageSVG
                contentFit="contain"
                src={LogoComponent}
            />
        </View>
    );
}

export default ExpensifyWordmark;
