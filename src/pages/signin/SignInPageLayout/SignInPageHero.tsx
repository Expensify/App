import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import SignInHeroCopy from './SignInHeroCopy';
import SignInHeroImage from './SignInHeroImage';
import type {SignInPageLayoutProps} from './types';

type SignInPageHeroProps = Pick<SignInPageLayoutProps, 'customHeadline' | 'customHeroBody'>;

function SignInPageHero({customHeadline, customHeroBody}: SignInPageHeroProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth, windowHeight} = useWindowDimensions();
    return (
        <View
            style={[
                StyleUtils.getHeight(windowHeight < variables.signInContentMinHeight ? variables.signInContentMinHeight : windowHeight),
                StyleUtils.getMinimumHeight(variables.signInContentMinHeight),
                windowWidth <= variables.tabletResponsiveWidthBreakpoint ? styles.flexColumn : styles.flexColumn,
                styles.pt20,
                StyleUtils.getMaximumWidth(variables.signInHeroContextMaxWidth),
                styles.alignSelfCenter,
            ]}
        >
            <View style={[styles.flex1, styles.alignSelfCenter, styles.gap7]}>
                <SignInHeroImage />
                <SignInHeroCopy
                    customHeadline={customHeadline}
                    customHeroBody={customHeroBody}
                />
            </View>
        </View>
    );
}

export default SignInPageHero;
