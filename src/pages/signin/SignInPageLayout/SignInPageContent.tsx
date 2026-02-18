import React from 'react';
import {View} from 'react-native';
import ExpensifyWordmark from '@components/ExpensifyWordmark';
import FormElement from '@components/FormElement';
import OfflineIndicator from '@components/OfflineIndicator';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import SignInHeroImage from './SignInHeroImage';
import type {SignInPageLayoutProps} from './types';

type SignInPageContentProps = Pick<SignInPageLayoutProps, 'welcomeText' | 'welcomeHeader' | 'shouldShowWelcomeText' | 'shouldShowWelcomeHeader'> & {
    /** The children to show inside the layout */
    children?: React.ReactNode;
};

function SignInPageContent({shouldShowWelcomeHeader, welcomeHeader, welcomeText, shouldShowWelcomeText, children}: SignInPageContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View style={[styles.flex1, styles.signInPageLeftContainer]}>
            <View style={[styles.flex1, styles.alignSelfCenter, styles.signInPageWelcomeFormContainer]}>
                {/* This empty view creates margin on the top of the sign in form which will shrink and grow depending on if the keyboard is open or not */}
                <View style={[styles.flexGrow1, shouldUseNarrowLayout ? styles.signInPageContentTopSpacerSmallScreens : styles.signInPageContentTopSpacer]} />
                <View style={[styles.flexGrow2, styles.mb8]}>
                    <FormElement style={[styles.alignSelfStretch]}>
                        <View style={[shouldUseNarrowLayout ? styles.mb8 : styles.mb15, shouldUseNarrowLayout ? styles.alignItemsCenter : styles.alignSelfStart]}>
                            <ExpensifyWordmark />
                        </View>
                        <View style={[styles.signInPageWelcomeTextContainer]}>
                            {shouldShowWelcomeHeader && welcomeHeader ? (
                                <Text
                                    style={[
                                        styles.loginHeroHeader,
                                        StyleUtils.getLineHeightStyle(variables.lineHeightSignInHeroXSmall),
                                        StyleUtils.getFontSizeStyle(variables.fontSizeSignInHeroXSmall),
                                        !welcomeText ? styles.mb5 : {},
                                        !shouldUseNarrowLayout ? styles.textAlignLeft : {},
                                        styles.mb5,
                                    ]}
                                >
                                    {welcomeHeader}
                                </Text>
                            ) : null}
                            {shouldShowWelcomeText && welcomeText ? (
                                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !shouldUseNarrowLayout ? styles.textAlignLeft : {}]}>{welcomeText}</Text>
                            ) : null}
                        </View>
                        {children}
                    </FormElement>
                    <View style={[styles.mb8, styles.signInPageWelcomeTextContainer, styles.alignSelfCenter]}>
                        <OfflineIndicator style={[styles.m0, styles.pl0, styles.alignItemsStart]} />
                    </View>
                    {shouldUseNarrowLayout ? (
                        <View style={[styles.mt8]}>
                            <SignInHeroImage />
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

export default SignInPageContent;
