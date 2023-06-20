import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import styles from '../../../styles/styles';
import ExpensifyWordmark from '../../../components/ExpensifyWordmark';
import Text from '../../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import SignInPageForm from '../../../components/SignInPageForm';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import OfflineIndicator from '../../../components/OfflineIndicator';
import SignInHeroImage from '../SignInHeroImage';
import * as StyleUtils from '../../../styles/StyleUtils';
import variables from '../../../styles/variables';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Welcome text to show in the header of the form, changes depending
     * on form type (set password, sign in, etc.) */
    welcomeText: PropTypes.string.isRequired,

    /** Welcome header to show in the header of the form, changes depending
     * on form type (set password, sign in, etc.) and small vs large screens */
    welcomeHeader: PropTypes.string.isRequired,

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    /** Whether to show welcome header on a particular page */
    shouldShowWelcomeHeader: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

function SignInPageContent(props) {
    return (
        <ScrollView
            contentContainerStyle={[styles.flex1, styles.signInPageLeftContainer]}
            keyboardShouldPersistTaps="handled"
            style={[!props.isSmallScreenWidth && styles.signInPageLeftContainerWide, styles.flex1]}
        >
            <View style={[styles.flex1, styles.alignSelfCenter, styles.signInPageWelcomeFormContainer]}>
                {/* This empty view creates margin on the top of the sign in form which will shrink and grow depending on if the keyboard is open or not */}
                <View style={[styles.flexGrow1, styles.signInPageContentTopSpacer]} />

                <View style={[styles.flexGrow2, styles.mb8]}>
                    <SignInPageForm style={[styles.alignSelfStretch]}>
                        <View style={[props.isSmallScreenWidth ? styles.mb8 : styles.mb15, props.isSmallScreenWidth ? styles.alignItemsCenter : styles.alignSelfStart]}>
                            <ExpensifyWordmark />
                        </View>
                        <View style={[styles.signInPageWelcomeTextContainer]}>
                            {props.shouldShowWelcomeHeader && props.welcomeHeader ? (
                                <Text
                                    style={[
                                        styles.loginHeroHeader,
                                        StyleUtils.getLineHeightStyle(variables.lineHeightSignInHeroXSmall),
                                        StyleUtils.getFontSizeStyle(variables.fontSizeSignInHeroXSmall),
                                        !props.welcomeText ? styles.mb5 : {},
                                        !props.isSmallScreenWidth ? styles.textAlignLeft : {},
                                        styles.mb5,
                                    ]}
                                >
                                    {props.welcomeHeader}
                                </Text>
                            ) : null}
                            {props.shouldShowWelcomeText && props.welcomeText ? (
                                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !props.isSmallScreenWidth ? styles.textAlignLeft : {}]}>{props.welcomeText}</Text>
                            ) : null}
                        </View>
                        {props.children}
                    </SignInPageForm>
                    <View style={[styles.mb8, styles.signInPageWelcomeTextContainer, styles.alignSelfCenter]}>
                        <OfflineIndicator style={[styles.m0, styles.pl0, styles.alignItemsStart]} />
                    </View>
                    {props.isSmallScreenWidth ? (
                        <View>
                            <SignInHeroImage />
                        </View>
                    ) : null}
                </View>
            </View>
        </ScrollView>
    );
}

SignInPageContent.propTypes = propTypes;
SignInPageContent.displayName = 'SignInPageContent';

export default compose(withWindowDimensions, withLocalize, withSafeAreaInsets)(SignInPageContent);
