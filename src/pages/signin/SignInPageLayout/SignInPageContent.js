import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import styles from '../../../styles/styles';
import ExpensifyWordmark from '../../../components/ExpensifyWordmark';
import Text from '../../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import SignInPageForm from '../../../components/SignInPageForm';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
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

    welcomeHeader: PropTypes.string.isRequired,

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    /** Whether to show welcome header on a particular page */
    shouldShowWelcomeHeader: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const SignInPageContent = props => (
    <View
        contentContainerStyle={[styles.flex1, styles.signInPageLeftContainer]}
        keyboardShouldPersistTaps="handled"
        style={[!props.isSmallScreenWidth && styles.signInPageLeftContainerWide, styles.flex1]}
    >
        <KeyboardAvoidingView
            behavior="padding"
            style={[styles.flex1, styles.alignSelfCenter, styles.signInPageWelcomeFormContainer]}

            // This vertical offset is here to add some more margin above the keyboard. Without it, the TOS and footer stuff still hides behind the keyboard by a few pixels.
            keyboardVerticalOffset={50}
        >
            {/* This empty view creates margin on the top of the sign in form which will shrink and grow depending on if the keyboard is open or not */}
            <View style={[styles.flexGrow1, styles.signInPageContentTopSpacer]} />

            <View style={[styles.flexGrow2]}>
                <SignInPageForm style={[styles.alignSelfStretch]}>
                    <View style={[props.isSmallScreenWidth ? styles.gap8 : styles.gap15]}>
                        <View style={[
                            props.isSmallScreenWidth ? styles.alignItemsCenter : {},

                            // ...(props.isSmallScreenWidth ? [styles.mb2] : [styles.mt6, styles.mb5]),
                            !props.isSmallScreenWidth ? styles.alignSelfStart : {},
                        ]}
                        >
                            <ExpensifyWordmark />
                        </View>
                        <View style={[styles.gap5, styles.signInPageWelcomeTextContainer]}>
                            {(props.shouldShowWelcomeHeader && props.welcomeHeader) ? (
                                <Text style={[
                                    styles.loginHeroHeader,
                                    StyleUtils.getFontSizeStyle(variables.fontSizeSignInHeroXSmall),
                                    !props.welcomeText ? styles.mb5 : {},
                                    !props.isSmallScreenWidth ? styles.textAlignLeft : {},
                                ]}
                                >
                                    {props.welcomeHeader}
                                </Text>
                            ) : undefined}
                            {(props.shouldShowWelcomeText && props.welcomeText) ? (
                                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !props.isSmallScreenWidth ? styles.textAlignLeft : {}]}>
                                    {props.welcomeText}
                                </Text>
                            ) : undefined}
                        </View>
                    </View>
                    {props.children}
                </SignInPageForm>
                {props.isSmallScreenWidth ? (
                    <View style={[styles.mt8]}>
                        <SignInHeroImage />
                    </View>
                ) : undefined}
            </View>
            <View style={[]}>
                {/* Google Auth */}
            </View>
        </KeyboardAvoidingView>
        <View style={[styles.mb5, styles.signInPageWelcomeTextContainer, styles.alignSelfCenter]}>
            <OfflineIndicator style={[styles.m0, styles.pl0, styles.alignItemsStart]} />
        </View>
    </View>
);

SignInPageContent.propTypes = propTypes;
SignInPageContent.displayName = 'SignInPageContent';

export default compose(
    withWindowDimensions,
    withLocalize,
    withSafeAreaInsets,
)(SignInPageContent);
