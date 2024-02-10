import React from 'react';
import {View} from 'react-native';
import ExpensifyWordmark from '@components/ExpensifyWordmark';
import OfflineIndicator from '@components/OfflineIndicator';
import SignInPageForm from '@components/SignInPageForm';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import SignInHeroImage from './SignInHeroImage';
import type {SignInPageLayoutProps} from './types';

type SignInPageContentProps = Pick<SignInPageLayoutProps, 'welcomeText' | 'welcomeHeader' | 'shouldShowWelcomeText' | 'shouldShowWelcomeHeader' | 'shouldShowSmallScreen'> & {
    /** The children to show inside the layout */
    children?: React.ReactNode;
};

function SignInPageContent({shouldShowWelcomeHeader, welcomeHeader, welcomeText, shouldShowWelcomeText, shouldShowSmallScreen, children}: SignInPageContentProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View style={[styles.flex1, styles.signInPageLeftContainer]}>
            <View style={[styles.flex1, styles.alignSelfCenter, styles.signInPageWelcomeFormContainer]}>
                {/* This empty view creates margin on the top of the sign in form which will shrink and grow depending on if the keyboard is open or not */}
                <View style={[styles.flexGrow1, isSmallScreenWidth ? styles.signInPageContentTopSpacerSmallScreens : styles.signInPageContentTopSpacer]} />
                <View style={[styles.flexGrow2, styles.mb8]}>
                    <SignInPageForm style={[styles.alignSelfStretch]}>
                        <View style={[isSmallScreenWidth ? styles.mb8 : styles.mb15, isSmallScreenWidth ? styles.alignItemsCenter : styles.alignSelfStart]}>
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
                                        !isSmallScreenWidth ? styles.textAlignLeft : {},
                                        styles.mb5,
                                    ]}
                                >
                                    {welcomeHeader}
                                </Text>
                            ) : null}
                            {shouldShowWelcomeText && welcomeText ? (
                                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>{welcomeText}</Text>
                            ) : null}
                        </View>
                        {children}
                    </SignInPageForm>
                    <View style={[styles.mb8, styles.signInPageWelcomeTextContainer, styles.alignSelfCenter]}>
                        <OfflineIndicator style={[styles.m0, styles.pl0, styles.alignItemsStart]} />
                    </View>
                    {shouldShowSmallScreen ? (
                        <View style={[styles.mt8]}>
                            <SignInHeroImage shouldShowSmallScreen />
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

SignInPageContent.displayName = 'SignInPageContent';

export default SignInPageContent;
